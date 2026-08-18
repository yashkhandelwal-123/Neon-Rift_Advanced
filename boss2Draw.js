"use strict";

/*=========================================
      CRIMSON WARDEN — DRAW SYSTEM
=========================================*/

/*
  Handles:
  - boss body
  - glow
  - rotating blades/rings
  - phase visuals
  - health bar
  - boss messages
*/


function showBoss2Message(text) {
  const message =
    document.getElementById(
      "gameMessage"
    );

  if (!message) return;

  message.textContent = text;
  message.style.opacity = "1";

  clearTimeout(
    showBoss2Message.timer
  );

  showBoss2Message.timer =
    setTimeout(() => {
      message.style.opacity = "0";
    }, 1700);
}


/*=========================================
        DRAW CRIMSON WARDEN
=========================================*/

function drawCrimsonWarden(
  boss
) {
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

  ctx.scale(
    boss.introScale || 1,
    boss.introScale || 1
  );


  /*=========================
          OUTER AURA
  =========================*/

  const auraRadius =
    boss.radius *
    (
      boss.phase === 3
        ? 2.5
        : 2
    );

  const aura =
    ctx.createRadialGradient(
      0,
      0,
      boss.radius * 0.2,
      0,
      0,
      auraRadius
    );

  aura.addColorStop(
    0,
    boss.phase === 3
      ? "rgba(255,255,255,.85)"
      : "rgba(255,23,79,.75)"
  );

  aura.addColorStop(
    0.35,
    "rgba(255,70,0,.35)"
  );

  aura.addColorStop(
    1,
    "rgba(255,23,79,0)"
  );

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
        ROTATING BLADES
  =========================*/

  for (
    let ring = 0;
    ring < 2;
    ring++
  ) {
    ctx.save();

    ctx.rotate(
      boss.rotation *
      (
        ring === 0
          ? 1
          : -1.4
      )
    );

    const bladeCount =
      ring === 0
        ? 6
        : 4;

    const distance =
      boss.radius *
      (
        ring === 0
          ? 1.35
          : 1.7
      );

    for (
      let i = 0;
      i < bladeCount;
      i++
    ) {
      const angle =
        Math.PI *
        2 *
        i /
        bladeCount;

      const x =
        Math.cos(angle) *
        distance;

      const y =
        Math.sin(angle) *
        distance;

      ctx.save();

      ctx.translate(
        x,
        y
      );

      ctx.rotate(
        angle +
        boss.rotation
      );

      ctx.shadowBlur =
        20;

      ctx.shadowColor =
        boss.phase === 3
          ? "#ffffff"
          : "#ff174f";

      ctx.strokeStyle =
        boss.phase === 3
          ? "#ffffff"
          : "#ff174f";

      ctx.fillStyle =
        "rgba(255,23,79,.14)";

      ctx.lineWidth = 2;

      ctx.beginPath();

      ctx.moveTo(
        -13,
        -5
      );

      ctx.lineTo(
        18,
        0
      );

      ctx.lineTo(
        -13,
        5
      );

      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }


  /*=========================
          MAIN BODY
  =========================*/

  ctx.save();

  ctx.rotate(
    boss.rotation * 0.8
  );

  const pulse =
    1 +
    Math.sin(
      boss.pulse
    ) *
    0.07;

  ctx.shadowBlur =
    boss.phase === 3
      ? 55
      : 35;

  ctx.shadowColor =
    boss.phase === 3
      ? "#ffffff"
      : "#ff174f";

  ctx.strokeStyle =
    boss.phase === 3
      ? "#ffffff"
      : "#ff174f";

  ctx.fillStyle =
    boss.phase === 3
      ? "rgba(255,255,255,.08)"
      : "rgba(255,23,79,.13)";

  ctx.lineWidth =
    boss.phase === 3
      ? 5
      : 4;

  ctx.beginPath();

  const sides = 8;

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
      boss.radius *
      pulse *
      (
        i % 2 === 0
          ? 1
          : 0.58
      );

    const x =
      Math.cos(angle) *
      radius;

    const y =
      Math.sin(angle) *
      radius;

    if (i === 0) {
      ctx.moveTo(
        x,
        y
      );
    } else {
      ctx.lineTo(
        x,
        y
      );
    }
  }

  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  ctx.restore();


  /*=========================
           INNER CORE
  =========================*/

  const coreGlow =
    ctx.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      boss.radius * 0.65
    );

  coreGlow.addColorStop(
    0,
    "#ffffff"
  );

  coreGlow.addColorStop(
    0.22,
    boss.phase === 3
      ? "#ffffff"
      : "#ff8a00"
  );

  coreGlow.addColorStop(
    0.55,
    "#ff174f"
  );

  coreGlow.addColorStop(
    1,
    "rgba(255,23,79,0)"
  );

  ctx.fillStyle =
    coreGlow;

  ctx.beginPath();

  ctx.arc(
    0,
    0,
    boss.radius * 0.65,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /*=========================
            EYE
  =========================*/

  const eyeAngle =
    Math.atan2(
      player.y - boss.y,
      player.x - boss.x
    );

  const eyeOffset =
    boss.phase === 3
      ? 10
      : 7;

  const eyeX =
    Math.cos(
      eyeAngle
    ) *
    eyeOffset;

  const eyeY =
    Math.sin(
      eyeAngle
    ) *
    eyeOffset;

  ctx.save();

  ctx.translate(
    eyeX,
    eyeY
  );

  ctx.shadowBlur =
    28;

  ctx.shadowColor =
    "#ffffff";

  ctx.fillStyle =
    "#ffffff";

  ctx.beginPath();

  ctx.ellipse(
    0,
    0,
    boss.phase === 3
      ? 15
      : 12,
    boss.phase === 3
      ? 8
      : 6,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.fillStyle =
    "#ff174f";

  ctx.beginPath();

  ctx.arc(
    2,
    0,
    boss.phase === 3
      ? 5
      : 4,
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
      boss.flash * 0.45;

    ctx.fillStyle =
      "#ffffff";

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      boss.radius * 1.35,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }


  ctx.restore();


  drawCrimsonWardenHealthBar(
    boss
  );
}


/*=========================================
         BOSS 2 HEALTH BAR
=========================================*/

function drawCrimsonWardenHealthBar(
  boss
) {
  if (
    !boss ||
    boss.dead
  ) {
    return;
  }

  const width =
    Math.min(
      650,
      Game.width * 0.6
    );

  const height = 18;

  const x =
    Game.width / 2 -
    width / 2;

  const y = 145;

  const ratio =
    Math.max(
      0,
      boss.health /
      boss.maximumHealth
    );

  ctx.save();

  ctx.fillStyle =
    "rgba(0,0,0,.72)";

  ctx.fillRect(
    x,
    y,
    width,
    height
  );

  ctx.strokeStyle =
    "rgba(255,255,255,.25)";

  ctx.strokeRect(
    x,
    y,
    width,
    height
  );

  const gradient =
    ctx.createLinearGradient(
      x,
      0,
      x + width,
      0
    );

  gradient.addColorStop(
    0,
    boss.phase === 3
      ? "#ffffff"
      : "#ff8a00"
  );

  gradient.addColorStop(
    0.45,
    "#ff174f"
  );

  gradient.addColorStop(
    1,
    "#8a0035"
  );

  ctx.fillStyle =
    gradient;

  ctx.shadowBlur =
    boss.phase === 3
      ? 25
      : 18;

  ctx.shadowColor =
    "#ff174f";

  ctx.fillRect(
    x,
    y,
    width * ratio,
    height
  );

  ctx.shadowBlur = 0;

  ctx.textAlign =
    "center";

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "700 13px Orbitron";

  ctx.fillText(
    "CRIMSON WARDEN // PHASE " +
    boss.phase,
    Game.width / 2,
    y - 12
  );

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
          DRAW BOSS 2 SYSTEM
=========================================*/

function drawBoss2() {
  if (
    !Boss2System.active ||
    !CrimsonWarden ||
    CrimsonWarden.dead
  ) {
    return;
  }

  if (
    typeof drawWardenBullets ===
    "function"
  ) {
    drawWardenBullets();
  }

  drawCrimsonWarden(
    CrimsonWarden
  );
}


/*=========================================
         UPDATE BOSS 2 SYSTEM
=========================================*/

function updateBoss2(
  deltaTime
) {
  if (
    !Game.running ||
    Game.paused
  ) {
    return;
  }


  if (
    !Boss2System.spawned &&
    !Boss2System.warningActive &&
    Game.time >=
      Boss2System.spawnTime &&
    typeof BossSystemV2 !==
      "undefined" &&
    BossSystemV2.defeated
  ) {
    beginBoss2Warning();
  }


  if (
    Boss2System.warningActive
  ) {
    Boss2System.warningTimer -=
      deltaTime;

    if (
      Boss2System.warningTimer <= 0
    ) {
      spawnCrimsonWarden();
    }
  }


  if (
    Boss2System.active &&
    CrimsonWarden &&
    !CrimsonWarden.dead
  ) {
    CrimsonWarden.updateCore(
      deltaTime
    );
  }
}


/*=========================================
            RESET BOSS 2
=========================================*/

function resetBoss2() {
  resetBoss2Core();

  if (
    typeof resetWardenBullets ===
    "function"
  ) {
    resetWardenBullets();
  }
}