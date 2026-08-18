"use strict";

/*=========================================
          NEON RIFT EFFECTS
=========================================*/

/*=========================================
        PLAYER AFTERIMAGES
=========================================*/

const AfterImages = [];

function createAfterImage(player) {
  AfterImages.push({
    x: player.x,
    y: player.y,
    angle: player.aimAngle,
    radius: player.radius,
    alpha: 0.75,
    life: 0.75,
    overdrive: player.overdriveActive
  });
}

function updateAfterImages(deltaTime) {
  for (
    let i = AfterImages.length - 1;
    i >= 0;
    i--
  ) {
    const image = AfterImages[i];

    image.life -= deltaTime;
    image.alpha = Math.max(0, image.life);

    if (image.life <= 0) {
      AfterImages.splice(i, 1);
    }
  }
}

function drawAfterImages() {
  for (const image of AfterImages) {
    ctx.save();

    ctx.translate(image.x, image.y);
    ctx.rotate(image.angle);

    ctx.globalAlpha = image.alpha * 0.6;

    ctx.shadowBlur = 35;

    ctx.shadowColor =
      image.overdrive
        ? "#ff2b72"
        : "#00f7ff";

    ctx.strokeStyle =
      image.overdrive
        ? "#ff2b72"
        : "#00f7ff";

    ctx.lineWidth = 3;

    ctx.beginPath();

    for (let i = 0; i < 6; i++) {
      const angle =
        Math.PI * 2 * i / 6;

      const x =
        Math.cos(angle) *
        image.radius;

      const y =
        Math.sin(angle) *
        image.radius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }
}


/*=========================================
        OVERDRIVE LIGHTNING
=========================================*/

const OverdriveArcs = [];

function createOverdriveArc() {
  OverdriveArcs.push({
    angle:
      Math.random() *
      Math.PI *
      2,

    distance:
      28 +
      Math.random() *
      34,

    life:
      0.12 +
      Math.random() *
      0.12,

    maxLife: 0.24,

    rotation:
      Math.random() *
      Math.PI *
      2
  });
}

function updateOverdriveArcs(deltaTime) {
  if (
    typeof player !== "undefined" &&
    player.overdriveActive
  ) {
    if (Math.random() < 0.45) {
      createOverdriveArc();
    }
  }

  for (
    let i =
      OverdriveArcs.length - 1;
    i >= 0;
    i--
  ) {
    const arc =
      OverdriveArcs[i];

    arc.life -= deltaTime;
    arc.rotation += deltaTime * 5;

    if (arc.life <= 0) {
      OverdriveArcs.splice(i, 1);
    }
  }
}

function drawOverdriveArcs() {
  if (
    typeof player === "undefined" ||
    !player.overdriveActive
  ) {
    return;
  }

  ctx.save();

  ctx.translate(
    player.x,
    player.y
  );

  for (const arc of OverdriveArcs) {
    const alpha =
      Math.max(
        0,
        arc.life /
        arc.maxLife
      );

    ctx.globalAlpha = alpha;

    ctx.strokeStyle =
      Math.random() > 0.5
        ? "#ffffff"
        : "#ff2b72";

    ctx.lineWidth = 2.5;

    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ff2b72";

    const startAngle =
      arc.angle +
      arc.rotation;

    const startX =
      Math.cos(startAngle) *
      arc.distance;

    const startY =
      Math.sin(startAngle) *
      arc.distance;

    const endAngle =
      startAngle + 0.45;

    const endX =
      Math.cos(endAngle) *
      (
        arc.distance +
        18
      );

    const endY =
      Math.sin(endAngle) *
      (
        arc.distance +
        18
      );

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    const segments = 5;

    for (
      let i = 1;
      i < segments;
      i++
    ) {
      const progress =
        i / segments;

      const x =
        startX +
        (
          endX -
          startX
        ) *
        progress +
        (
          Math.random() -
          0.5
        ) *
        15;

      const y =
        startY +
        (
          endY -
          startY
        ) *
        progress +
        (
          Math.random() -
          0.5
        ) *
        15;

      ctx.lineTo(x, y);
    }

    ctx.lineTo(
      endX,
      endY
    );

    ctx.stroke();
  }

  ctx.restore();
}


/*=========================================
      OVERDRIVE ACTIVATION FX
=========================================*/

let OverdriveFlash = 0;

let OverdrivePulseText = {
  active: false,
  life: 0
};

function triggerOverdriveFX() {
  OverdriveFlash = 0.9;

  OverdrivePulseText.active = true;
  OverdrivePulseText.life = 1.2;
}

function updateOverdriveActivationFX(deltaTime) {
  OverdriveFlash =
    Math.max(
      0,
      OverdriveFlash -
      deltaTime * 2.5
    );

  if (
    OverdrivePulseText.active
  ) {
    OverdrivePulseText.life -=
      deltaTime;

    if (
      OverdrivePulseText.life <= 0
    ) {
      OverdrivePulseText.active =
        false;
    }
  }
}

function drawOverdriveActivationFX() {
  if (OverdriveFlash > 0) {
    ctx.save();

    ctx.fillStyle =
      `rgba(255,255,255,${
        OverdriveFlash * 0.55
      })`;

    ctx.fillRect(
      0,
      0,
      Game.width,
      Game.height
    );

    ctx.restore();
  }

  if (
    OverdrivePulseText.active
  ) {
    ctx.save();

    const alpha =
      Math.max(
        0,
        OverdrivePulseText.life /
        1.2
      );

    ctx.globalAlpha = alpha;

    ctx.textAlign = "center";

    ctx.font =
      "900 42px Orbitron";

    ctx.fillStyle = "#ffffff";

    ctx.shadowBlur = 30;
    ctx.shadowColor = "#ff2b72";

    ctx.fillText(
      "OVERDRIVE",
      Game.width / 2,
      Game.height * 0.28
    );

    ctx.restore();
  }
}


/*=========================================
          IMPACT FX
=========================================*/

const ImpactFlashes = [];
const DebrisShards = [];
const ImpactRings = [];

function createImpactFX(
  x,
  y,
  color = "#ffffff",
  power = 1
) {
  ImpactFlashes.push({
    x,
    y,
    radius:
      18 +
      power * 14,

    life: 1,

    color
  });

  ImpactRings.push({
    x,
    y,
    radius:
      8 +
      power * 3,

    maxRadius:
      55 +
      power * 38,

    life: 1,

    color
  });

  const shardCount =
    Math.floor(
      5 +
      power * 4
    );

  for (
    let i = 0;
    i < shardCount;
    i++
  ) {
    const angle =
      Math.random() *
      Math.PI *
      2;

    const speed =
      90 +
      Math.random() *
      180 *
      power;

    DebrisShards.push({
      x,
      y,

      vx:
        Math.cos(angle) *
        speed,

      vy:
        Math.sin(angle) *
        speed,

      rotation:
        Math.random() *
        Math.PI *
        2,

      rotationSpeed:
        (
          Math.random() -
          0.5
        ) *
        12,

      size:
        2 +
        Math.random() *
        5,

      life:
        0.35 +
        Math.random() *
        0.45,

      color
    });
  }

  Camera.shake =
    Math.max(
      Camera.shake,
      3 + power * 4
    );
}

function updateImpactFX(deltaTime) {
  for (
    let i =
      ImpactFlashes.length - 1;
    i >= 0;
    i--
  ) {
    const flash =
      ImpactFlashes[i];

    flash.life -=
      deltaTime * 4.5;

    if (flash.life <= 0) {
      ImpactFlashes.splice(i, 1);
    }
  }

  for (
    let i =
      ImpactRings.length - 1;
    i >= 0;
    i--
  ) {
    const ring =
      ImpactRings[i];

    ring.life -=
      deltaTime * 2.4;

    ring.radius +=
      (
        ring.maxRadius -
        ring.radius
      ) *
      deltaTime *
      8;

    if (ring.life <= 0) {
      ImpactRings.splice(i, 1);
    }
  }

  for (
    let i =
      DebrisShards.length - 1;
    i >= 0;
    i--
  ) {
    const shard =
      DebrisShards[i];

    shard.x +=
      shard.vx *
      deltaTime;

    shard.y +=
      shard.vy *
      deltaTime;

    shard.vx *=
      Math.pow(
        0.04,
        deltaTime
      );

    shard.vy *=
      Math.pow(
        0.04,
        deltaTime
      );

    shard.rotation +=
      shard.rotationSpeed *
      deltaTime;

    shard.life -=
      deltaTime;

    if (shard.life <= 0) {
      DebrisShards.splice(i, 1);
    }
  }
}

function drawImpactFX() {
  /* FLASHES */

  for (
    const flash of
    ImpactFlashes
  ) {
    ctx.save();

    ctx.globalAlpha =
      Math.max(
        0,
        flash.life
      );

    const glow =
      ctx.createRadialGradient(
        flash.x,
        flash.y,
        0,

        flash.x,
        flash.y,
        flash.radius
      );

    glow.addColorStop(
      0,
      "#ffffff"
    );

    glow.addColorStop(
      0.3,
      flash.color
    );

    glow.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    ctx.fillStyle = glow;

    ctx.beginPath();

    ctx.arc(
      flash.x,
      flash.y,
      flash.radius,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }

  /* RINGS */

  for (
    const ring of
    ImpactRings
  ) {
    ctx.save();

    ctx.globalAlpha =
      Math.max(
        0,
        ring.life
      );

    ctx.strokeStyle =
      ring.color;

    ctx.lineWidth =
      3 *
      ring.life;

    ctx.shadowBlur = 16;
    ctx.shadowColor =
      ring.color;

    ctx.beginPath();

    ctx.arc(
      ring.x,
      ring.y,
      ring.radius,
      0,
      Math.PI * 2
    );

    ctx.stroke();

    ctx.restore();
  }

  /* SHARDS */

  for (
    const shard of
    DebrisShards
  ) {
    ctx.save();

    ctx.translate(
      shard.x,
      shard.y
    );

    ctx.rotate(
      shard.rotation
    );

    ctx.globalAlpha =
      Math.max(
        0,
        shard.life
      );

    ctx.fillStyle =
      shard.color;

    ctx.shadowBlur = 10;

    ctx.shadowColor =
      shard.color;

    ctx.fillRect(
      -shard.size,
      -shard.size / 2,
      shard.size * 2,
      shard.size
    );

    ctx.restore();
  }
}


/*=========================================
             RESET
=========================================*/

function resetEffects() {
  AfterImages.length = 0;
  OverdriveArcs.length = 0;

  ImpactFlashes.length = 0;
  ImpactRings.length = 0;
  DebrisShards.length = 0;

  OverdriveFlash = 0;

  OverdrivePulseText.active = false;
  OverdrivePulseText.life = 0;
}

/*=========================================
          BOSS RAGE FX
=========================================*/

let BossRageFlash = 0;

let BossRageText = {
  active: false,
  life: 0
};

function triggerBossRageFX() {
  BossRageFlash = 1;

  BossRageText.active = true;
  BossRageText.life = 1.8;
}

function updateBossRageFX(deltaTime) {
  BossRageFlash =
    Math.max(
      0,
      BossRageFlash -
      deltaTime * 1.8
    );

  if (BossRageText.active) {
    BossRageText.life -= deltaTime;

    if (BossRageText.life <= 0) {
      BossRageText.active = false;
    }
  }
}

function drawBossRageFX() {
  if (BossRageFlash > 0) {
    ctx.save();

    ctx.fillStyle =
      `rgba(120,0,180,${
        BossRageFlash * 0.32
      })`;

    ctx.fillRect(
      0,
      0,
      Game.width,
      Game.height
    );

    ctx.restore();
  }

  if (BossRageText.active) {
    ctx.save();

    const alpha =
      Math.max(
        0,
        BossRageText.life / 1.8
      );

    ctx.globalAlpha = alpha;

    ctx.textAlign = "center";

    ctx.font =
      "900 48px Orbitron";

    ctx.fillStyle = "#ffffff";

    ctx.shadowBlur = 35;
    ctx.shadowColor = "#ff2b72";

    ctx.fillText(
      "RAGE MODE",
      Game.width / 2,
      Game.height * 0.24
    );

    ctx.restore();
  }
}