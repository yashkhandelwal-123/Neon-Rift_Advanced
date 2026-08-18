"use strict";

/*=========================================
        NEON RIFT — BOSS DRAW
=========================================*/

/*
  Handles:
  - Boss body
  - Glowing eye
  - Rotating rings
  - Rage visuals
  - Boss health bar
  - Boss warnings/messages
*/


/*=========================================
          BOSS MESSAGE
=========================================*/

function showBossMessage(text) {
  const message =
    document.getElementById(
      "gameMessage"
    );

  if (!message) return;

  message.textContent = text;

  message.style.opacity = "1";

  clearTimeout(
    showBossMessage.timer
  );

  showBossMessage.timer =
    setTimeout(() => {
      message.style.opacity = "0";
    }, 1700);
}


/*=========================================
          DRAW VOID TITAN
=========================================*/

function drawVoidTitanV2(boss) {
  if (
    !boss ||
    boss.dead
  ) {
    return;
  }

  ctx.save();

  ctx.translate(
    boss.x,
    boss.y
  );

  /*=========================
      OUTER AURA
  =========================*/

  const auraRadius =
    boss.radius *
    (
      boss.phase === 3
        ? 2.3
        : 1.85
    );

  const aura =
    ctx.createRadialGradient(
      0,
      0,
      boss.radius * 0.3,
      0,
      0,
      auraRadius
    );

  if (boss.phase === 3) {
    aura.addColorStop(
      0,
      "rgba(255,255,255,.65)"
    );

    aura.addColorStop(
      0.35,
      "rgba(255,43,114,.35)"
    );

    aura.addColorStop(
      1,
      "rgba(255,43,114,0)"
    );
  } else {
    aura.addColorStop(
      0,
      "rgba(255,43,114,.45)"
    );

    aura.addColorStop(
      0.4,
      "rgba(140,40,255,.22)"
    );

    aura.addColorStop(
      1,
      "rgba(255,43,114,0)"
    );
  }

  ctx.fillStyle = aura;

  ctx.beginPath();

  ctx.arc(
    0,
    0,
    auraRadius,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /*=========================
        ROTATING RINGS
  =========================*/

  for (
    let i = 0;
    i < 3;
    i++
  ) {
    ctx.save();

    ctx.rotate(
      boss.rotation *
      (
        i % 2 === 0
          ? 1
          : -1
      ) *
      (
        1 + i * 0.35
      )
    );

    ctx.globalAlpha =
      0.55 - i * 0.1;

    ctx.strokeStyle =
      boss.phase === 3
        ? "#ffffff"
        : i % 2 === 0
          ? "#ff2b72"
          : "#8a43ff";

    ctx.lineWidth =
      2.5;

    ctx.shadowBlur =
      18;

    ctx.shadowColor =
      ctx.strokeStyle;

    ctx.setLineDash(
      [
        15 + i * 4,
        12 + i * 6
      ]
    );

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      boss.radius *
      (
        1.15 + i * 0.22
      ),
      0,
      Math.PI * 1.65
    );

    ctx.stroke();

    ctx.restore();
  }

  ctx.setLineDash([]);


  /*=========================
          TITAN BODY
  =========================*/

  ctx.save();

  ctx.rotate(
    boss.rotation
  );

  const pulseRadius =
    boss.radius +
    Math.sin(
      boss.pulse
    ) *
    (
      boss.phase === 3
        ? 11
        : 7
    );

  ctx.shadowBlur =
    boss.phase === 3
      ? 60
      : 42;

  ctx.shadowColor =
    boss.phase === 3
      ? "#ffffff"
      : "#ff2b72";

  ctx.strokeStyle =
    boss.phase === 3
      ? "#ffffff"
      : "#ff2b72";

  ctx.fillStyle =
    boss.phase === 3
      ? "rgba(255,255,255,.08)"
      : "rgba(255,43,114,.12)";

  ctx.lineWidth =
    boss.phase === 3
      ? 5
      : 4;

  ctx.beginPath();

  const sides = 12;

  for (
    let i = 0;
    i < sides;
    i++
  ) {
    const angle =
      Math.PI *
      2 *
      i /
      sides;

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

  ctx.restore();


  /*=========================
          INNER CORE
  =========================*/

  ctx.save();

  ctx.rotate(
    -boss.rotation * 1.8
  );

  ctx.strokeStyle =
    boss.phase === 3
      ? "#ff2b72"
      : "#ffffff";

  ctx.lineWidth = 3;

  ctx.globalAlpha = 0.85;

  ctx.shadowBlur = 24;

  ctx.shadowColor =
    ctx.strokeStyle;

  ctx.beginPath();

  ctx.arc(
    0,
    0,
    boss.radius * 0.52,
    0,
    Math.PI * 1.55
  );

  ctx.stroke();

  ctx.restore();


  /*=========================
          TITAN EYE
  =========================*/

  ctx.save();

  // Eye follows the player

const eyeAngle =
  Math.atan2(
    player.y - boss.y,
    player.x - boss.x
  );

const eyeDistance =
  boss.phase === 3
    ? 11
    : 8;

const eyeOffsetX =
  Math.cos(eyeAngle) *
  eyeDistance;

const eyeOffsetY =
  Math.sin(eyeAngle) *
  eyeDistance;

  const eyePulse =
    1 +
    Math.sin(
      Game.time * 8
    ) *
    0.12;

  const eyeRadius =
    boss.phase === 3
      ? 18 * eyePulse
      : 13 * eyePulse;

  const eyeGlow =
    ctx.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      eyeRadius * 2.8
    );

  eyeGlow.addColorStop(
    0,
    "#ffffff"
  );

  eyeGlow.addColorStop(
    0.25,
    boss.phase === 3
      ? "#ffffff"
      : "#ff2b72"
  );

  eyeGlow.addColorStop(
    0.6,
    boss.phase === 3
      ? "rgba(255,43,114,.8)"
      : "rgba(255,43,114,.5)"
  );

  eyeGlow.addColorStop(
    1,
    "rgba(255,43,114,0)"
  );

  ctx.fillStyle =
    eyeGlow;

  ctx.beginPath();

  ctx.arc(
    0,
    0,
    eyeRadius * 2.8,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.fillStyle =
    "#ffffff";

  ctx.shadowBlur =
    30;

  ctx.shadowColor =
    "#ffffff";

  ctx.beginPath();

  ctx.ellipse(
    eyeOffsetX,
    eyeOffsetY,
    eyeRadius,
    eyeRadius * 0.52,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.fillStyle =
    boss.phase === 3
      ? "#ff2b72"
      : "#12000a";

  ctx.beginPath();

  ctx.arc(
    eyeOffsetX,
    eyeOffsetY,
    eyeRadius * 0.35,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();


  /*=========================
        DAMAGE FLASH
  =========================*/

  if (
    boss.flash > 0
  ) {
    ctx.save();

    ctx.globalAlpha =
      boss.flash * 0.4;

    ctx.fillStyle =
      "#ffffff";

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      boss.radius * 1.25,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }


  ctx.restore();


  /*=========================
        BOSS HEALTH BAR
  =========================*/

  drawVoidTitanHealthBar(
    boss
  );
}


/*=========================================
        BOSS HEALTH BAR
=========================================*/

function drawVoidTitanHealthBar(
  boss
) {
  if (
    !boss ||
    boss.dead
  ) {
    return;
  }

  const barWidth =
    Math.min(
      620,
      Game.width * 0.58
    );

  const barHeight = 18;

  const x =
    Game.width / 2 -
    barWidth / 2;

  const y = 145;

  const healthRatio =
    Math.max(
      0,
      boss.health /
      boss.maximumHealth
    );

  ctx.save();

  /* BACKGROUND */

  ctx.fillStyle =
    "rgba(0,0,0,.72)";

  ctx.fillRect(
    x,
    y,
    barWidth,
    barHeight
  );

  /* BORDER */

  ctx.strokeStyle =
    "rgba(255,255,255,.28)";

  ctx.lineWidth = 1;

  ctx.strokeRect(
    x,
    y,
    barWidth,
    barHeight
  );

  /* HEALTH */

  const gradient =
    ctx.createLinearGradient(
      x,
      0,
      x + barWidth,
      0
    );

  if (boss.phase === 1) {
    gradient.addColorStop(
      0,
      "#ff2b72"
    );

    gradient.addColorStop(
      1,
      "#8a43ff"
    );
  }

  if (boss.phase === 2) {
    gradient.addColorStop(
      0,
      "#ff6a00"
    );

    gradient.addColorStop(
      1,
      "#ff2b72"
    );
  }

  if (boss.phase === 3) {
    gradient.addColorStop(
      0,
      "#ffffff"
    );

    gradient.addColorStop(
      0.5,
      "#ff2b72"
    );

    gradient.addColorStop(
      1,
      "#8a43ff"
    );
  }

  ctx.fillStyle =
    gradient;

  ctx.shadowBlur =
    boss.phase === 3
      ? 25
      : 18;

  ctx.shadowColor =
    boss.phase === 3
      ? "#ffffff"
      : "#ff2b72";

  ctx.fillRect(
    x,
    y,
    barWidth *
    healthRatio,
    barHeight
  );

  ctx.shadowBlur = 0;

  /* NAME */

  ctx.textAlign =
    "center";

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "700 13px Orbitron";

  ctx.fillText(
    "VOID TITAN // PHASE " +
    boss.phase,
    Game.width / 2,
    y - 12
  );

  /* HEALTH NUMBER */

  ctx.font =
    "600 10px Orbitron";

  ctx.fillStyle =
    "rgba(255,255,255,.65)";

  ctx.fillText(
    Math.ceil(
      boss.health
    ) +
    " / " +
    boss.maximumHealth,
    Game.width / 2,
    y + 42
  );

  ctx.restore();
}


/*=========================================
        DRAW COMPLETE BOSS SYSTEM
=========================================*/

function drawBossV2() {
  if (
    !BossSystemV2.active ||
    !VoidTitanV2 ||
    VoidTitanV2.dead
  ) {
    return;
  }

  /* BULLET HELL */

  if (
    typeof drawBossAttackBullets ===
    "function"
  ) {
    drawBossAttackBullets();
  }

  /* LASER */

  if (
    typeof drawBossLaser ===
    "function"
  ) {
    drawBossLaser(
      VoidTitanV2
    );
  }

  /* TITAN */

  drawVoidTitanV2(
    VoidTitanV2
  );
}


/*=========================================
          BOSS UPDATE MANAGER
=========================================*/

function updateBossV2(
  deltaTime
) {
  if (
    !Game.running ||
    Game.paused
  ) {
    return;
  }

  /*=========================
        BEGIN WARNING
  =========================*/

  if (
    !BossSystemV2.spawned &&
    !BossSystemV2.warningActive &&
    Game.time >=
      BossSystemV2.spawnTime
  ) {
    beginBossWarningV2();
  }


  /*=========================
          WARNING TIMER
  =========================*/

  if (
    BossSystemV2.warningActive
  ) {
    BossSystemV2.warningTimer -=
      deltaTime;

    if (
      BossSystemV2.warningTimer <= 0
    ) {
      spawnVoidTitanV2();
    }
  }


  /*=========================
          BOSS UPDATE
  =========================*/

  if (
    BossSystemV2.active &&
    VoidTitanV2 &&
    !VoidTitanV2.dead
  ) {
    VoidTitanV2.updateCore(
      deltaTime
    );
  }
}


/*=========================================
          RESET BOSS V2
=========================================*/

function resetBossV2() {
  resetBossCoreV2();

  if (
    typeof resetBossAttacksV2 ===
    "function"
  ) {
    resetBossAttacksV2();
  }

  if (
    typeof resetBossLaser ===
    "function"
  ) {
    resetBossLaser();
  }
}