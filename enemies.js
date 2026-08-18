"use strict";

const Enemies = [];

let enemySpawnTimer = 0;
let enemySpawnDelay = 1.2;

/* =========================
   BASE ENEMY
========================= */

class Enemy {
  constructor(type = "drone") {
    this.type = type;
    this.dead = false;

    this.spawnOutsideScreen();

    this.angle = Math.random() * Math.PI * 2;
    this.rotation = Math.random() * Math.PI * 2;
    this.pulse = Math.random() * Math.PI * 2;

    if (type === "drone") {
      this.radius = 17;
      this.speed = 115;
      this.health = 1;
      this.color = "#ff2b72";
      this.scoreValue = 100;
    }

    if (type === "dasher") {
      this.radius = 13;
      this.speed = 95;
      this.health = 1;
      this.color = "#ffb000";
      this.scoreValue = 180;

      this.dashTimer = 1.6;
      this.dashing = false;
      this.dashDuration = 0;
    }

    if (type === "tank") {
      this.radius = 30;
      this.speed = 55;
      this.health = 4;
      this.color = "#9b4dff";
      this.scoreValue = 450;
    }

    if (type === "orbiter") {
      this.radius = 15;
      this.speed = 75;
      this.health = 2;
      this.color = "#00f7ff";
      this.scoreValue = 300;

      this.orbitAngle =
        Math.random() * Math.PI * 2;

      this.orbitDistance =
        170 + Math.random() * 90;
    }
  }

  spawnOutsideScreen() {
    const side =
      Math.floor(Math.random() * 4);

    if (side === 0) {
      this.x = Math.random() * Game.width;
      this.y = -70;
    }

    if (side === 1) {
      this.x = Game.width + 70;
      this.y = Math.random() * Game.height;
    }

    if (side === 2) {
      this.x = Math.random() * Game.width;
      this.y = Game.height + 70;
    }

    if (side === 3) {
      this.x = -70;
      this.y = Math.random() * Game.height;
    }
  }

  update(deltaTime) {
    this.rotation += deltaTime * 2.5;
    this.pulse += deltaTime * 4;

    if (this.type === "drone") {
      this.updateDrone(deltaTime);
    }

    if (this.type === "dasher") {
      this.updateDasher(deltaTime);
    }

    if (this.type === "tank") {
      this.updateTank(deltaTime);
    }

    if (this.type === "orbiter") {
      this.updateOrbiter(deltaTime);
    }

    this.checkPlayerCollision();
  }

  updateDrone(deltaTime) {
    const angle =
      Math.atan2(
        player.y - this.y,
        player.x - this.x
      );

    const zigzag =
      Math.sin(Game.time * 7 + this.angle) * 0.7;

    this.x +=
      Math.cos(angle + zigzag) *
      this.speed *
      deltaTime;

    this.y +=
      Math.sin(angle + zigzag) *
      this.speed *
      deltaTime;
  }

  updateDasher(deltaTime) {
    this.dashTimer -= deltaTime;

    const angle =
      Math.atan2(
        player.y - this.y,
        player.x - this.x
      );

    if (
      this.dashTimer <= 0 &&
      !this.dashing
    ) {
      this.dashing = true;
      this.dashDuration = 0.35;
      this.dashTimer = 2;

      createShockwave(
        this.x,
        this.y,
        this.color,
        8,
        80
      );
    }

    if (this.dashing) {
      this.x +=
        Math.cos(angle) *
        470 *
        deltaTime;

      this.y +=
        Math.sin(angle) *
        470 *
        deltaTime;

      this.dashDuration -= deltaTime;

      createTrail(
        this.x,
        this.y,
        18,
        this.color
      );

      if (this.dashDuration <= 0) {
        this.dashing = false;
      }
    } else {
      this.x +=
        Math.cos(angle) *
        this.speed *
        deltaTime;

      this.y +=
        Math.sin(angle) *
        this.speed *
        deltaTime;
    }
  }

  updateTank(deltaTime) {
    const angle =
      Math.atan2(
        player.y - this.y,
        player.x - this.x
      );

    this.x +=
      Math.cos(angle) *
      this.speed *
      deltaTime;

    this.y +=
      Math.sin(angle) *
      this.speed *
      deltaTime;
  }

  updateOrbiter(deltaTime) {
    this.orbitAngle +=
      deltaTime * 1.8;

    const targetX =
      player.x +
      Math.cos(this.orbitAngle) *
      this.orbitDistance;

    const targetY =
      player.y +
      Math.sin(this.orbitAngle) *
      this.orbitDistance;

    this.x +=
      (targetX - this.x) *
      deltaTime *
      2;

    this.y +=
      (targetY - this.y) *
      deltaTime *
      2;
  }

  checkPlayerCollision() {
    const collisionDistance =
      this.radius + player.radius;

    const currentDistance =
      Math.hypot(
        this.x - player.x,
        this.y - player.y
      );

    if (
      currentDistance <
      collisionDistance
    ) {
      if (player.dashing) {
        this.takeDamage(2);
      } else {
        damagePlayer(18);

        const angle =
          Math.atan2(
            this.y - player.y,
            this.x - player.x
          );

        this.x += Math.cos(angle) * 35;
        this.y += Math.sin(angle) * 35;
      }
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    createImpactFX(
    this.x,
    this.y,
    "#00f7ff",
    0.8
);

    createParticles(
      this.x,
      this.y,
      this.color,
      12,
      220
    );

    Camera.shake = 7;

    if (this.health <= 0) {
      this.destroy();
    }
  }

  destroy() {
    if (this.dead) return;

    createImpactFX(
    this.x,
    this.y,
    "#ff7a18",
    2
);

    this.dead = true;

    createParticles(
      this.x,
      this.y,
      this.color,
      this.type === "tank" ? 50 : 28,
      this.type === "tank" ? 380 : 270
    );

    createShockwave(
      this.x,
      this.y,
      this.color,
      12,
      this.type === "tank" ? 180 : 110
    );

    Camera.shake =
      this.type === "tank" ? 15 : 8;

    Game.score +=
      this.scoreValue * Game.combo;

    Game.combo = Math.min(
      Game.combo + 1,
      25
    );

    const xpReward =
  this.type === "tank"
    ? 35
    : this.type === "orbiter"
      ? 25
      : this.type === "dasher"
        ? 18
        : 12;

addXP(xpReward);

    player.overdrive = Math.min(
      100,
      player.overdrive +
      (this.type === "tank" ? 14 : 6)
    );
  }

  draw() {
    ctx.save();

    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const pulseRadius =
      this.radius +
      Math.sin(this.pulse) * 3;

    ctx.shadowBlur =
      this.type === "tank" ? 35 : 22;

    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;

    ctx.fillStyle =
      this.type === "tank"
        ? "rgba(155,77,255,0.18)"
        : "rgba(255,43,114,0.12)";

    ctx.lineWidth =
      this.type === "tank" ? 4 : 2;

    const sides =
      this.type === "tank"
        ? 8
        : this.type === "orbiter"
          ? 6
          : 4;

    ctx.beginPath();

    for (let i = 0; i < sides; i++) {
      const angle =
        Math.PI * 2 * i / sides;

      const radius =
        i % 2 === 0
          ? pulseRadius
          : pulseRadius * 0.62;

      const x =
        Math.cos(angle) * radius;

      const y =
        Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.rotate(-this.rotation * 2);

    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ffffff";

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      this.type === "tank" ? 7 : 4,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }
}

/* =========================
   ENEMY MANAGER
========================= */

function spawnEnemy() {
  let type = "drone";
  const chance = Math.random();

  if (
    Game.time > 12 &&
    chance < 0.2
  ) {
    type = "tank";
  } else if (
    Game.time > 7 &&
    chance < 0.45
  ) {
    type = "dasher";
  } else if (
    Game.time > 18 &&
    chance < 0.62
  ) {
    type = "orbiter";
  }

  Enemies.push(
    new Enemy(type)
  );
}

function updateEnemies(deltaTime) {
  enemySpawnTimer -= deltaTime;

  enemySpawnDelay = Math.max(
    0.32,
    1.25 - Game.time * 0.012
  );

if (
  enemySpawnTimer <= 0 &&
  !BossSystemV2.active &&
  !BossSystemV2.warningActive &&
  !Boss2System.active &&
  !Boss2System.warningActive
) {
    spawnEnemy();

    enemySpawnTimer =
      enemySpawnDelay;
  }

  for (
    let i = Enemies.length - 1;
    i >= 0;
    i--
  ) {
    Enemies[i].update(deltaTime);

    if (Enemies[i].dead) {
      Enemies.splice(i, 1);
    }
  }
}

function drawEnemies() {
  for (const enemy of Enemies) {
    enemy.draw();
  }
}

function resetEnemies() {
  Enemies.length = 0;
  enemySpawnTimer = 1;
}