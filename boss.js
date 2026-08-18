"use strict";

const BossBullets = [];

const BossSystem = {
  active: false,
  spawned: false,
  warningActive: false,
  warningTimer: 0
};

/* =========================
        BOSS BULLET
========================= */

class BossBullet {
  constructor(
    x,
    y,
    angle,
    speed = 240,
    homing = false
  ) {
    this.x = x;
    this.y = y;

    this.angle = angle;
    this.speed = speed;

    this.radius = homing ? 9 : 7;
    this.homing = homing;

    this.life = 8;
    this.dead = false;
  }

  update(deltaTime) {
    if (this.homing) {
      const targetAngle = Math.atan2(
        player.y - this.y,
        player.x - this.x
      );

      let difference =
        targetAngle - this.angle;

      difference = Math.atan2(
        Math.sin(difference),
        Math.cos(difference)
      );

      this.angle +=
        difference *
        deltaTime *
        1.5;
    }

    this.x +=
      Math.cos(this.angle) *
      this.speed *
      deltaTime;

    this.y +=
      Math.sin(this.angle) *
      this.speed *
      deltaTime;

    this.life -= deltaTime;

    if (
      this.life <= 0 ||
      this.x < -100 ||
      this.x > Game.width + 100 ||
      this.y < -100 ||
      this.y > Game.height + 100
    ) {
      this.dead = true;
    }

    if (
      !this.dead &&
      Math.hypot(
        this.x - player.x,
        this.y - player.y
      ) <
      this.radius + player.radius
    ) {
      if (
        player.dashing ||
        player.invincibleTimer > 0
      ) {
        this.dead = true;

        createParticles(
          this.x,
          this.y,
          "#00f7ff",
          8,
          160
        );
      } else {
        this.dead = true;
        damagePlayer(14);
      }
    }
  }

  draw() {
    ctx.save();

    ctx.translate(this.x, this.y);
    ctx.rotate(Game.time * 5);

    ctx.shadowBlur = 25;
    ctx.shadowColor = "#ff2b72";

    ctx.fillStyle = this.homing
      ? "#ffb000"
      : "#ff2b72";

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.rect(
      -this.radius,
      -this.radius,
      this.radius * 2,
      this.radius * 2
    );

    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

/* =========================
         VOID TITAN
========================= */

class VoidTitan {
  constructor() {
    this.x = Game.width / 2;
    this.y = -150;

    this.radius = 82;

    this.maximumHealth = 220;
    this.health = this.maximumHealth;

    this.speed = 65;
    this.rotation = 0;
    this.pulse = 0;

    this.phase = 1;
    this.attackTimer = 2;
    this.chargeTimer = 5;

    this.charging = false;
    this.chargeDuration = 0;
    this.chargeAngle = 0;

    this.dead = false;
  }

  update(deltaTime) {
    this.rotation += deltaTime * 0.8;
    this.pulse += deltaTime * 4;

    const healthRatio =
      this.health /
      this.maximumHealth;

    const newPhase =
      healthRatio > 0.66
        ? 1
        : healthRatio > 0.33
          ? 2
          : 3;

    if (newPhase !== this.phase) {
      this.phase = newPhase;

      showBossMessage(
        "VOID TITAN // PHASE " +
        this.phase
      );

      Camera.shake = 22;

      createShockwave(
        this.x,
        this.y,
        "#ff2b72",
        30,
        450
      );
    }

    if (this.charging) {
      this.x +=
        Math.cos(this.chargeAngle) *
        650 *
        deltaTime;

      this.y +=
        Math.sin(this.chargeAngle) *
        650 *
        deltaTime;

      this.chargeDuration -= deltaTime;

      createTrail(
        this.x,
        this.y,
        55,
        "#ff2b72"
      );

      if (this.chargeDuration <= 0) {
        this.charging = false;
      }
    } else {
      const targetX =
        Game.width / 2;

      const targetY =
        Math.min(
          Game.height * 0.3,
          230
        );

      this.x +=
        (targetX - this.x) *
        deltaTime *
        0.8;

      this.y +=
        (targetY - this.y) *
        deltaTime *
        0.8;
    }

    this.attackTimer -= deltaTime;
    this.chargeTimer -= deltaTime;

    if (this.attackTimer <= 0) {
      this.chooseAttack();

      this.attackTimer =
        this.phase === 1
          ? 2.1
          : this.phase === 2
            ? 1.55
            : 1.05;
    }

    if (
      this.phase >= 2 &&
      this.chargeTimer <= 0 &&
      !this.charging
    ) {
      this.beginCharge();

      this.chargeTimer =
        this.phase === 3
          ? 3.2
          : 4.8;
    }

    this.checkPlayerCollision();
  }

  chooseAttack() {
    const chance = Math.random();

    if (this.phase === 1) {
      if (chance < 0.65) {
        this.radialAttack(18, 220);
      } else {
        this.homingAttack(5);
      }
    }

    if (this.phase === 2) {
      if (chance < 0.45) {
        this.radialAttack(24, 250);
      } else if (chance < 0.75) {
        this.homingAttack(7);
      } else {
        this.spiralAttack();
      }
    }

    if (this.phase === 3) {
      if (chance < 0.35) {
        this.radialAttack(34, 285);
      } else if (chance < 0.65) {
        this.homingAttack(10);
      } else {
        this.spiralAttack();
      }
    }
  }

  radialAttack(amount, speed) {
    const offset =
      Game.time * 0.7;

    for (let i = 0; i < amount; i++) {
      const angle =
        offset +
        Math.PI * 2 * i / amount;

      BossBullets.push(
        new BossBullet(
          this.x,
          this.y,
          angle,
          speed
        )
      );
    }

    createShockwave(
      this.x,
      this.y,
      "#ff2b72",
      20,
      180
    );

    Camera.shake = 8;
  }

  homingAttack(amount) {
    for (let i = 0; i < amount; i++) {
      const angle =
        Math.random() *
        Math.PI *
        2;

      BossBullets.push(
        new BossBullet(
          this.x,
          this.y,
          angle,
          145,
          true
        )
      );
    }

    showBossMessage(
      "HOMING VOID SWARM"
    );
  }

  spiralAttack() {
    const arms =
      this.phase === 3
        ? 5
        : 3;

    for (let arm = 0; arm < arms; arm++) {
      for (let i = 0; i < 8; i++) {
        const delay = i * 70;

        setTimeout(() => {
          if (
            !Game.running ||
            this.dead
          ) {
            return;
          }

          const angle =
            Game.time * 1.7 +
            arm *
            Math.PI *
            2 /
            arms +
            i * 0.15;

          BossBullets.push(
            new BossBullet(
              this.x,
              this.y,
              angle,
              210 +
              this.phase * 20
            )
          );
        }, delay);
      }
    }
  }

  beginCharge() {
    this.charging = true;
    this.chargeDuration = 0.55;

    this.chargeAngle =
      Math.atan2(
        player.y - this.y,
        player.x - this.x
      );

    showBossMessage(
      "TITAN CHARGE DETECTED"
    );

    createShockwave(
      this.x,
      this.y,
      "#ffffff",
      20,
      180
    );
  }

  checkPlayerCollision() {
    if (
      Math.hypot(
        this.x - player.x,
        this.y - player.y
      ) <
      this.radius + player.radius
    ) {
      if (player.dashing) {
        this.takeDamage(2);
      } else {
        damagePlayer(30);
      }
    }
  }

  takeDamage(amount) {
    if (this.dead) return;

    this.health -= amount;

    createParticles(
      this.x,
      this.y,
      "#ff2b72",
      7,
      150
    );

    if (this.health <= 0) {
      this.destroy();
    }
  }

  destroy() {
    if (this.dead) return;

    this.dead = true;

    BossSystem.active = false;

    Game.score +=
      15000 *
      Game.combo;

    addXP(250);

    createParticles(
      this.x,
      this.y,
      "#ff2b72",
      170,
      700
    );

    createParticles(
      this.x,
      this.y,
      "#ffffff",
      100,
      550
    );

    createShockwave(
      this.x,
      this.y,
      "#ffffff",
      30,
      900
    );

    Camera.shake = 40;

    showBossMessage(
      "VOID TITAN DESTROYED"
    );
  }

  draw() {
    ctx.save();

    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const pulseRadius =
      this.radius +
      Math.sin(this.pulse) * 8;

    ctx.shadowBlur = 55;
    ctx.shadowColor =
      this.phase === 3
        ? "#ffffff"
        : "#ff2b72";

    ctx.strokeStyle =
      this.phase === 3
        ? "#ffffff"
        : "#ff2b72";

    ctx.fillStyle =
      "rgba(255,43,114,0.14)";

    ctx.lineWidth = 5;

    ctx.beginPath();

    for (let i = 0; i < 12; i++) {
      const angle =
        Math.PI * 2 * i / 12;

      const radius =
        i % 2 === 0
          ? pulseRadius
          : pulseRadius * 0.62;

      const x =
        Math.cos(angle) *
        radius;

      const y =
        Math.sin(angle) *
        radius;

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

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(
      0,
      0,
      this.radius * 0.48,
      0,
      Math.PI * 1.6
    );
    ctx.stroke();

    ctx.fillStyle = "#ffffff";

    ctx.beginPath();
    ctx.arc(
      0,
      0,
      10,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();

    this.drawHealthBar();
  }

  drawHealthBar() {
    const width = 360;
    const ratio =
      Math.max(
        0,
        this.health /
        this.maximumHealth
      );

    ctx.save();

    ctx.fillStyle =
      "rgba(0,0,0,0.7)";

    ctx.fillRect(
      Game.width / 2 -
      width / 2,
      205,
      width,
      16
    );

    ctx.fillStyle =
      this.phase === 3
        ? "#ffffff"
        : "#ff2b72";

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff2b72";

    ctx.fillRect(
      Game.width / 2 -
      width / 2,
      205,
      width * ratio,
      16
    );

    ctx.fillStyle = "#ffffff";
    ctx.font =
      "700 12px Orbitron";

    ctx.textAlign = "center";

    ctx.fillText(
      "VOID TITAN // PHASE " +
      this.phase,
      Game.width / 2,
      195
    );

    ctx.restore();
  }
}

let voidTitan = null;

/* =========================
       BOSS SYSTEM
========================= */

function showBossMessage(text) {
  const message =
    document.getElementById(
      "gameMessage"
    );

  message.textContent = text;
  message.style.opacity = "1";

  clearTimeout(
    showBossMessage.timer
  );

  showBossMessage.timer =
    setTimeout(() => {
      message.style.opacity = "0";
    }, 1800);
}

function beginBossWarning() {
  if (
    BossSystem.spawned ||
    BossSystem.warningActive
  ) {
    return;
  }

  BossSystem.warningActive = true;
  BossSystem.warningTimer = 3;

  showBossMessage(
    "⚠ VOID TITAN APPROACHING ⚠"
  );

  Camera.shake = 18;
  World.lightningFlash = 1;
}

function spawnVoidTitan() {
  BossSystem.warningActive = false;
  BossSystem.active = true;
  BossSystem.spawned = true;

  voidTitan = new VoidTitan();

  Enemies.length = 0;

  createShockwave(
    Game.width / 2,
    0,
    "#ff2b72",
    30,
    700
  );

  Camera.shake = 28;
}

function updateBossSystem(deltaTime) {
  if (
    !BossSystem.spawned &&
    !BossSystem.warningActive &&
    Game.time >= 60
  ) {
    beginBossWarning();
  }

  if (BossSystem.warningActive) {
    BossSystem.warningTimer -=
      deltaTime;

    if (
      BossSystem.warningTimer <= 0
    ) {
      spawnVoidTitan();
    }
  }

  if (
    BossSystem.active &&
    voidTitan &&
    !voidTitan.dead
  ) {
    voidTitan.update(deltaTime);
  }

  for (
    let i = BossBullets.length - 1;
    i >= 0;
    i--
  ) {
    BossBullets[i].update(
      deltaTime
    );

    if (BossBullets[i].dead) {
      BossBullets.splice(i, 1);
    }
  }
}

function drawBossSystem() {
  for (
    const bullet of
    BossBullets
  ) {
    bullet.draw();
  }

  if (
    BossSystem.active &&
    voidTitan &&
    !voidTitan.dead
  ) {
    voidTitan.draw();
  }
}

function resetBossSystem() {
  BossBullets.length = 0;

  BossSystem.active = false;
  BossSystem.spawned = false;
  BossSystem.warningActive = false;
  BossSystem.warningTimer = 0;

  voidTitan = null;
}