"use strict";

/* =========================================
            NEON RIFT WORLD ENGINE
========================================= */

const World = {
  rotation: 0,

  meteorTimer: 6,
  lightningTimer: 4,
  pulseTimer: 3,

  lightningFlash: 0,
  dangerLevel: 1
};

const Meteors = [];
const FogClouds = [];
const NebulaClouds = [];
const RiftPulses = [];

/* =========================================
              INITIAL SETUP
========================================= */

function createWorldEffects() {
  FogClouds.length = 0;
  NebulaClouds.length = 0;

  for (let i = 0; i < 12; i++) {
    FogClouds.push({
      x: Math.random() * Game.width,
      y: Math.random() * Game.height,

      radius:
        120 +
        Math.random() * 220,

      speed:
        5 +
        Math.random() * 12,

      alpha:
        0.015 +
        Math.random() * 0.025
    });
  }

  for (let i = 0; i < 7; i++) {
    NebulaClouds.push({
      x: Math.random() * Game.width,
      y: Math.random() * Game.height,

      radius:
        180 +
        Math.random() * 320,

      speed:
        2 +
        Math.random() * 6,

      alpha:
        0.02 +
        Math.random() * 0.035,

      color:
        Math.random() > 0.5
          ? "130, 40, 255"
          : "0, 247, 255"
    });
  }
}


/* =========================================
                  METEOR
========================================= */

class Meteor {
  constructor() {
    this.targetX =
      100 +
      Math.random() *
      Math.max(
        100,
        Game.width - 200
      );

    this.targetY =
      100 +
      Math.random() *
      Math.max(
        100,
        Game.height - 200
      );

    this.x =
      this.targetX +
      Math.random() * 500 -
      250;

    this.y = -180;

    this.radius =
      28 +
      Math.random() * 26;

    this.warningTime = 1.6;
    this.speed =
      600 +
      Math.random() * 240;

    this.dead = false;
    this.exploded = false;

    this.rotation =
      Math.random() *
      Math.PI *
      2;
  }

  update(deltaTime) {
    if (this.warningTime > 0) {
      this.warningTime -= deltaTime;
      return;
    }

    const angle =
      Math.atan2(
        this.targetY - this.y,
        this.targetX - this.x
      );

    this.x +=
      Math.cos(angle) *
      this.speed *
      deltaTime;

    this.y +=
      Math.sin(angle) *
      this.speed *
      deltaTime;

    this.rotation +=
      deltaTime * 5;

    if (
      Math.hypot(
        this.x - this.targetX,
        this.y - this.targetY
      ) <
      this.speed * deltaTime + 12
    ) {
      this.explode();
    }
  }

  explode() {
    if (this.exploded) return;

    this.exploded = true;
    this.dead = true;

    const blastRadius =
      this.radius * 3.5;

    createParticles(
      this.targetX,
      this.targetY,
      "#ff7a18",
      85,
      520
    );

    createParticles(
      this.targetX,
      this.targetY,
      "#ffffff",
      35,
      380
    );

    createShockwave(
      this.targetX,
      this.targetY,
      "#ff7a18",
      20,
      blastRadius * 1.8
    );

    Camera.shake = Math.max(
      Camera.shake,
      24
    );

    if (
      typeof player !== "undefined"
    ) {
      const playerDistance =
        Math.hypot(
          player.x - this.targetX,
          player.y - this.targetY
        );

      if (
        playerDistance <
        blastRadius + player.radius
      ) {
        damagePlayer(28);
      }
    }

    if (
      typeof Enemies !== "undefined"
    ) {
      for (const enemy of Enemies) {
        if (enemy.dead) continue;

        const enemyDistance =
          Math.hypot(
            enemy.x - this.targetX,
            enemy.y - this.targetY
          );

        if (
          enemyDistance <
          blastRadius + enemy.radius
        ) {
          enemy.takeDamage(
            enemy.type === "tank"
              ? 3
              : 99
          );
        }
      }
    }
  }

  drawWarning() {
    if (this.warningTime <= 0) {
      return;
    }

    const warningProgress =
      1 -
      this.warningTime / 1.6;

    const pulse =
      1 +
      Math.sin(
        Game.time * 18
      ) *
      0.08;

    ctx.save();

    ctx.translate(
      this.targetX,
      this.targetY
    );

    ctx.globalAlpha =
      0.35 +
      warningProgress * 0.45;

    ctx.strokeStyle = "#ff3b3b";
    ctx.lineWidth = 3;

    ctx.shadowBlur = 25;
    ctx.shadowColor = "#ff3b3b";

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      this.radius *
        3.5 *
        pulse,
      0,
      Math.PI * 2
    );

    ctx.stroke();

    ctx.globalAlpha = 0.18;

    ctx.fillStyle = "#ff3b3b";

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      this.radius *
        3 *
        warningProgress,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }

  drawMeteor() {
    if (this.warningTime > 0) {
      return;
    }

    ctx.save();

    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const trailAngle =
      Math.atan2(
        this.targetY - this.y,
        this.targetX - this.x
      );

    ctx.rotate(trailAngle);

    const trail =
      ctx.createLinearGradient(
        -this.radius * 6,
        0,
        this.radius,
        0
      );

    trail.addColorStop(
      0,
      "rgba(255,70,0,0)"
    );

    trail.addColorStop(
      0.55,
      "rgba(255,80,0,0.35)"
    );

    trail.addColorStop(
      1,
      "rgba(255,255,255,0.9)"
    );

    ctx.fillStyle = trail;

    ctx.beginPath();

    ctx.moveTo(
      -this.radius * 6,
      -this.radius * 0.7
    );

    ctx.lineTo(
      this.radius,
      -this.radius
    );

    ctx.lineTo(
      this.radius,
      this.radius
    );

    ctx.lineTo(
      -this.radius * 6,
      this.radius * 0.7
    );

    ctx.closePath();
    ctx.fill();

    ctx.rotate(-trailAngle);

    ctx.shadowBlur = 35;
    ctx.shadowColor = "#ff5a00";

    ctx.fillStyle = "#ff7a18";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;

    ctx.beginPath();

    for (let i = 0; i < 8; i++) {
      const angle =
        Math.PI * 2 * i / 8;

      const radius =
        this.radius *
        (
          0.8 +
          Math.random() * 0.25
        );

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

    ctx.restore();
  }

  draw() {
    this.drawWarning();
    this.drawMeteor();
  }
}

/* =========================================
                RIFT PULSE
========================================= */

function createRiftPulse() {
  RiftPulses.push({
    x: Game.width / 2,
    y: Game.height / 2,

    radius: 80,
    maximumRadius:
      Math.max(
        Game.width,
        Game.height
      ),

    life: 1
  });
}

/* =========================================
                  UPDATE
========================================= */

function updateWorld(deltaTime) {
  World.rotation +=
    deltaTime * 0.15;

  World.dangerLevel =
    1 +
    Math.floor(
      Game.time / 30
    );

  World.meteorTimer -= deltaTime;
  World.lightningTimer -= deltaTime;
  World.pulseTimer -= deltaTime;

  const meteorDelay =
    Math.max(
      2.4,
      7 -
      World.dangerLevel * 0.45
    );

  if (
    World.meteorTimer <= 0 &&
    Game.running &&
    !Game.paused
  ) {
    const meteorAmount =
      Math.min(
        4,
        1 +
        Math.floor(
          World.dangerLevel / 3
        )
      );

    for (
      let i = 0;
      i < meteorAmount;
      i++
    ) {
      Meteors.push(
        new Meteor()
      );
    }

    World.meteorTimer =
      meteorDelay +
      Math.random() * 2;
  }

  if (
    World.lightningTimer <= 0
  ) {
    World.lightningFlash =
      0.45 +
      Math.random() * 0.35;

    Camera.shake = Math.max(
      Camera.shake,
      4
    );

    World.lightningTimer =
      5 +
      Math.random() * 8;
  }

  if (World.pulseTimer <= 0) {
    createRiftPulse();

    World.pulseTimer =
      3 +
      Math.random() * 2;
  }

  for (
    let i = Meteors.length - 1;
    i >= 0;
    i--
  ) {
    Meteors[i].update(deltaTime);

    if (Meteors[i].dead) {
      Meteors.splice(i, 1);
    }
  }

  for (
    let i = RiftPulses.length - 1;
    i >= 0;
    i--
  ) {
    const pulse =
      RiftPulses[i];

    pulse.life -=
      deltaTime * 0.45;

    pulse.radius +=
      (
        pulse.maximumRadius -
        pulse.radius
      ) *
      deltaTime *
      0.9;

    if (pulse.life <= 0) {
      RiftPulses.splice(i, 1);
    }
  }

  for (const fog of FogClouds) {
    fog.x +=
      fog.speed * deltaTime;

    if (
      fog.x - fog.radius >
      Game.width
    ) {
      fog.x =
        -fog.radius;
    }
  }

  for (
    const nebula of
    NebulaClouds
  ) {
    nebula.y +=
      nebula.speed *
      deltaTime;

    if (
      nebula.y -
      nebula.radius >
      Game.height
    ) {
      nebula.y =
        -nebula.radius;
    }
  }

  World.lightningFlash =
    Math.max(
      0,
      World.lightningFlash -
      deltaTime * 2.5
    );
}

/* =========================================
             BACKGROUND EFFECTS
========================================= */

function drawNebula() {
  ctx.save();

  for (
    const cloud of
    NebulaClouds
  ) {
    const gradient =
      ctx.createRadialGradient(
        cloud.x,
        cloud.y,
        0,

        cloud.x,
        cloud.y,
        cloud.radius
      );

    gradient.addColorStop(
      0,
      `rgba(${cloud.color}, ${cloud.alpha})`
    );

    gradient.addColorStop(
      1,
      `rgba(${cloud.color}, 0)`
    );

    ctx.fillStyle = gradient;

    ctx.beginPath();

    ctx.arc(
      cloud.x,
      cloud.y,
      cloud.radius,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  ctx.restore();
}

function drawFog() {
  ctx.save();

  for (
    const cloud of
    FogClouds
  ) {
    const gradient =
      ctx.createRadialGradient(
        cloud.x,
        cloud.y,
        0,

        cloud.x,
        cloud.y,
        cloud.radius
      );

    gradient.addColorStop(
      0,
      `rgba(140, 40, 255, ${cloud.alpha})`
    );

    gradient.addColorStop(
      1,
      "rgba(140, 40, 255, 0)"
    );

    ctx.fillStyle = gradient;

    ctx.beginPath();

    ctx.arc(
      cloud.x,
      cloud.y,
      cloud.radius,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  ctx.restore();
}

/* =========================================
                    GRID
========================================= */

function drawGrid() {
  const spacing = 70;
  const horizon =
    Game.height * 0.62;

  ctx.save();

  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = "#00f7ff";
  ctx.lineWidth = 1;

  for (
    let x = -Game.width;
    x < Game.width * 2;
    x += spacing
  ) {
    ctx.beginPath();

    ctx.moveTo(
      Game.width / 2,
      horizon
    );

    ctx.lineTo(
      x,
      Game.height
    );

    ctx.stroke();
  }

  for (
    let y = horizon;
    y < Game.height;
    y += 24
  ) {
    const progress =
      (
        y -
        horizon
      ) /
      (
        Game.height -
        horizon
      );

    const curvedY =
      horizon +
      progress *
      progress *
      (
        Game.height -
        horizon
      );

    ctx.beginPath();

    ctx.moveTo(
      0,
      curvedY
    );

    ctx.lineTo(
      Game.width,
      curvedY
    );

    ctx.stroke();
  }

  ctx.restore();
}

/* =========================================
                    RIFT
========================================= */

function drawRift() {
  ctx.save();

  ctx.translate(
    Game.width / 2,
    Game.height / 2
  );

  for (let i = 0; i < 7; i++) {
    const radius =
      110 +
      i * 55 +
      Math.sin(
        Game.time * 1.8 + i
      ) *
      12;

    ctx.strokeStyle =
      i % 2
        ? "rgba(255,43,157,.1)"
        : "rgba(0,247,255,.1)";

    ctx.lineWidth = 2;

    ctx.setLineDash([
      16,
      24
    ]);

    ctx.lineDashOffset =
      Game.time *
      (
        25 +
        i * 4
      );

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      radius,
      World.rotation + i,
      Math.PI * 1.6 +
      World.rotation +
      i
    );

    ctx.stroke();
  }

  ctx.restore();

  ctx.setLineDash([]);
}

function drawRiftPulses() {
  ctx.save();

  for (
    const pulse of
    RiftPulses
  ) {
    ctx.globalAlpha =
      Math.max(
        0,
        pulse.life
      ) *
      0.18;

    ctx.strokeStyle =
      "#00f7ff";

    ctx.lineWidth =
      6 * pulse.life;

    ctx.shadowBlur = 30;
    ctx.shadowColor =
      "#00f7ff";

    ctx.beginPath();

    ctx.arc(
      pulse.x,
      pulse.y,
      pulse.radius,
      0,
      Math.PI * 2
    );

    ctx.stroke();
  }

  ctx.restore();
}

/* =========================================
                FOREGROUND FX
========================================= */

function drawMeteors() {
  for (
    const meteor of Meteors
  ) {
    meteor.draw();
  }
}

function drawLightningFlash() {
  if (
    World.lightningFlash <= 0
  ) {
    return;
  }

  ctx.save();

  ctx.fillStyle =
    `rgba(
      185,
      210,
      255,
      ${World.lightningFlash}
    )`;

  ctx.fillRect(
    0,
    0,
    Game.width,
    Game.height
  );

  ctx.restore();
}

/* =========================================
                  RESET
========================================= */

function resetWorld() {
  Meteors.length = 0;
  RiftPulses.length = 0;

  World.rotation = 0;
  World.meteorTimer = 5;
  World.lightningTimer = 4;
  World.pulseTimer = 2;
  World.lightningFlash = 0;
  World.dangerLevel = 1;

  createWorldEffects();
}