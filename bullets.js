"use strict";

const PlayerBullets = [];

let shootCooldown = 0;

class PlayerBullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;

    this.angle = angle;

this.speed =
  720 *
  Game.bulletSpeedMultiplier *
  (player.overdriveActive ? 1.6 : 1);

this.damage =
  player.overdriveActive
    ? Game.bulletDamage * 2
    : Game.bulletDamage;
    this.radius = 5;

    this.life = 1.4;
    this.dead = false;

    this.color = "#00f7ff";
  }

  update(deltaTime) {
    this.x +=
      Math.cos(this.angle) *
      this.speed *
      deltaTime;

    this.y +=
      Math.sin(this.angle) *
      this.speed *
      deltaTime;

    this.life -= deltaTime;

    createTrail(
      this.x,
      this.y,
      9,
      this.color
    );

    if (
      this.life <= 0 ||
      this.x < -50 ||
      this.x > Game.width + 50 ||
      this.y < -50 ||
      this.y > Game.height + 50
    ) {
      this.dead = true;
    }

    this.checkEnemyCollision();
  }

  checkEnemyCollision() {

  /*=========================
        VOID TITAN
  =========================*/

  if (
    typeof VoidTitanV2 !== "undefined" &&
    VoidTitanV2 &&
    !VoidTitanV2.dead
  ) {
    const bossDistance =
      Math.hypot(
        this.x - VoidTitanV2.x,
        this.y - VoidTitanV2.y
      );

    if (
      bossDistance <
      this.radius +
      VoidTitanV2.radius
    ) {
      VoidTitanV2.takeDamage(
        this.damage
      );

      this.dead = true;

      createImpactFX(
        this.x,
        this.y,
        "#ff2b72",
        1
      );

      return;
    }
  }


  /*=========================
      CRIMSON WARDEN
  =========================*/

  if (
    typeof CrimsonWarden !== "undefined" &&
    CrimsonWarden &&
    !CrimsonWarden.dead
  ) {
    const boss2Distance =
      Math.hypot(
        this.x - CrimsonWarden.x,
        this.y - CrimsonWarden.y
      );

    if (
      boss2Distance <
      this.radius +
      CrimsonWarden.radius
    ) {
      CrimsonWarden.takeDamage(
        this.damage
      );

      this.dead = true;

      createImpactFX(
        this.x,
        this.y,
        "#ff174f",
        1
      );

      return;
    }
  }


  /*=========================
        NORMAL ENEMIES
  =========================*/

  for (const enemy of Enemies) {

    if (enemy.dead) {
      continue;
    }

    const currentDistance =
      Math.hypot(
        this.x - enemy.x,
        this.y - enemy.y
      );

    if (
      currentDistance <
      this.radius +
      enemy.radius
    ) {
      enemy.takeDamage(
        this.damage
      );

      this.dead = true;

      createParticles(
        this.x,
        this.y,
        "#00f7ff",
        8,
        160
      );

      break;
    }
  }
}

  draw() {
    ctx.save();

    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.shadowBlur = 22;
    ctx.shadowColor = this.color;

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
      -8,
      -2,
      16,
      4
    );

    ctx.fillStyle = this.color;

    ctx.fillRect(
      -13,
      -1,
      10,
      2
    );

    ctx.restore();
  }
}

function shootPlayerBullet() {
  if (
    !Game.running ||
    Game.paused ||
    shootCooldown > 0
  ) {
    return;
  }

  const angle =
    Math.atan2(
      Mouse.y - player.y,
      Mouse.x - player.x
    );

const totalBullets =
  1 + Game.extraBullets;

const spread = 0.13;

for (let i = 0; i < totalBullets; i++) {
  const offset =
    (
      i -
      (totalBullets - 1) / 2
    ) *
    spread;

  const bulletAngle =
    angle + offset;

  PlayerBullets.push(
    new PlayerBullet(
      player.x +
        Math.cos(bulletAngle) * 22,

      player.y +
        Math.sin(bulletAngle) * 22,

      bulletAngle
    )
  );
}

shootCooldown =
  (player.overdriveActive ? 0.045 : 0.13)
  /
  Game.fireRateMultiplier;

  createParticles(
    player.x +
      Math.cos(angle) * 20,

    player.y +
      Math.sin(angle) * 20,

    "#00f7ff",
    5,
    100
  );
}

function updatePlayerBullets(deltaTime) {
  shootCooldown = Math.max(
    0,
    shootCooldown - deltaTime
  );

  if (Mouse.down) {
    shootPlayerBullet();
  }

  for (
    let i = PlayerBullets.length - 1;
    i >= 0;
    i--
  ) {
    PlayerBullets[i].update(deltaTime);

    if (PlayerBullets[i].dead) {
      PlayerBullets.splice(i, 1);
    }
  }
}

function drawPlayerBullets() {
  for (const bullet of PlayerBullets) {
    bullet.draw();
  }
}

function resetPlayerBullets() {
  PlayerBullets.length = 0;
  shootCooldown = 0;
}