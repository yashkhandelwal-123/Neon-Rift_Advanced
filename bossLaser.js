"use strict";

/*=========================================
        VOID TITAN LASER SYSTEM
=========================================*/

const BossLaser = {
  active: false,
  warning: false,

  angle: 0,

  timer: 0,
  warningTimer: 0,

  width: 24,

  sweepDirection: 1,
  sweepSpeed: 1.1,

  chargeGlow: 0
};


const LaserTrails = [];


/*=========================================
          UPDATE LASER
=========================================*/

function updateVoidTitanLaser(
  boss,
  deltaTime
) {
  if (
    !boss ||
    boss.dead ||
    boss.entering
  ) {
    return;
  }


  /*
    Only Phase 2 and Phase 3
    use the giant laser.
  */

  if (
    boss.phase < 2
  ) {
    return;
  }


  boss.laserTimer -=
    deltaTime;


  /*=========================================
            START WARNING
  =========================================*/

  if (
    boss.laserTimer <= 0 &&
    !BossLaser.warning &&
    !BossLaser.active
  ) {
    BossLaser.warning =
      true;


    if (
      typeof showBossMessage ===
      "function"
    ) {
      showBossMessage(
        "⚠ LASER CHARGING ⚠"
      );
    }


    Camera.shake =
      Math.max(
        Camera.shake,
        10
      );


    if (
      typeof World !==
      "undefined"
    ) {
      World.lightningFlash =
        0.35;
    }


    BossLaser.warningTimer =
      boss.phase === 3
        ? 1.25
        : 1.8;


    BossLaser.angle =
      Math.atan2(
        player.y - boss.y,
        player.x - boss.x
      );


    BossLaser.sweepDirection =
      Math.random() > 0.5
        ? 1
        : -1;


    BossLaser.chargeGlow =
      1;


    if (
      typeof createShockwave ===
      "function"
    ) {
      createShockwave(
        boss.x,
        boss.y,
        "#ff2b72",
        15,
        180
      );
    }
  }


  /*=========================================
            WARNING PHASE
  =========================================*/

  if (
    BossLaser.warning
  ) {
    BossLaser.warningTimer -=
      deltaTime;


    Camera.shake =
      Math.max(
        Camera.shake,
        3 +
        (
          (
            boss.phase === 3
              ? 1.25
              : 1.8
          ) -
          BossLaser.warningTimer
        ) *
        4
      );


    if (
      typeof World !==
      "undefined"
    ) {
      World.lightningFlash =
        Math.max(
          World.lightningFlash,
          0.08
        );
    }


    BossLaser.chargeGlow =
      Math.max(
        0,
        BossLaser.chargeGlow -
        deltaTime * 0.4
      );


    if (
      BossLaser.warningTimer <= 0
    ) {
      BossLaser.warning =
        false;


      BossLaser.active =
        true;


      BossLaser.timer =
        boss.phase === 3
          ? 2.7
          : 3.2;


      BossLaser.width =
        boss.phase === 3
          ? 38
          : 28;


      BossLaser.sweepSpeed =
        boss.phase === 3
          ? 1.85
          : 1.15;


      Camera.shake =
        20;


      if (
        typeof World !==
        "undefined"
      ) {
        World.lightningFlash =
          0.8;
      }


      if (
        typeof createImpactFX ===
        "function"
      ) {
        createImpactFX(
          boss.x,
          boss.y,
          "#ff2b72",
          3
        );
      }
    }


    updateLaserTrails(
      deltaTime
    );

    return;
  }


  /*=========================================
              ACTIVE LASER
  =========================================*/

  if (
    BossLaser.active
  ) {
    BossLaser.timer -=
      deltaTime;


    BossLaser.angle +=
      BossLaser.sweepSpeed *
      BossLaser.sweepDirection *
      deltaTime;


    LaserTrails.push({
      x: boss.x,
      y: boss.y,
      angle:
        BossLaser.angle,
      width:
        BossLaser.width,
      life:
        0.35
    });


    checkBossLaserHit(
      boss
    );


    Camera.shake =
      Math.max(
        Camera.shake,
        boss.phase === 3
          ? 8
          : 5
      );


    if (
      Math.random() < 0.25
    ) {
      createParticles(
        boss.x,
        boss.y,
        boss.phase === 3
          ? "#ffffff"
          : "#ff2b72",
        2,
        120
      );
    }


    if (
      BossLaser.timer <= 0
    ) {
      BossLaser.active =
        false;


      BossLaser.warning =
        false;


      BossLaser.chargeGlow =
        0;


      boss.laserTimer =
        boss.phase === 3
          ? 6
          : 9;


      createShockwave(
        boss.x,
        boss.y,
        "#ff2b72",
        20,
        220
      );
    }
  }


  updateLaserTrails(
    deltaTime
  );
}


/*=========================================
        PLAYER LASER COLLISION
=========================================*/

function checkBossLaserHit(
  boss
) {
  if (
    !BossLaser.active ||
    !player ||
    player.dashing ||
    player.invincibleTimer > 0 ||
    player.overdriveActive
  ) {
    return;
  }


  const dx =
    player.x -
    boss.x;


  const dy =
    player.y -
    boss.y;


  const distanceFromBoss =
    Math.hypot(
      dx,
      dy
    );


  if (
    distanceFromBoss < 20
  ) {
    return;
  }


  const angleToPlayer =
    Math.atan2(
      dy,
      dx
    );


  let difference =
    angleToPlayer -
    BossLaser.angle;


  difference =
    Math.atan2(
      Math.sin(
        difference
      ),
      Math.cos(
        difference
      )
    );


  const hitAngle =
    Math.atan2(
      BossLaser.width * 0.6,
      distanceFromBoss
    );


  if (
    Math.abs(
      difference
    ) <
    hitAngle
  ) {
    damagePlayer(
      boss.phase === 3
        ? 22
        : 16
    );
  }
}


/*=========================================
          UPDATE TRAILS
=========================================*/

function updateLaserTrails(
  deltaTime
) {
  for (
    let i =
      LaserTrails.length - 1;
    i >= 0;
    i--
  ) {
    LaserTrails[i].life -=
      deltaTime;


    if (
      LaserTrails[i].life <= 0
    ) {
      LaserTrails.splice(
        i,
        1
      );
    }
  }
}


/*=========================================
           DRAW WARNING
=========================================*/

function drawLaserWarning(
  boss
) {
  const length =
    Math.max(
      Game.width,
      Game.height
    ) *
    2;


  ctx.save();


  ctx.translate(
    boss.x,
    boss.y
  );


  ctx.rotate(
    BossLaser.angle
  );


  const pulse =
    0.45 +
    (
      Math.sin(
        Game.time * 22
      ) *
      0.5 +
      0.5
    ) *
    0.45;


  ctx.globalAlpha =
    pulse;


  ctx.strokeStyle =
    "#ff2b72";


  ctx.lineWidth =
    3;


  ctx.shadowBlur =
    20;


  ctx.shadowColor =
    "#ff2b72";


  ctx.beginPath();


  ctx.moveTo(
    0,
    0
  );


  ctx.lineTo(
    length,
    0
  );


  ctx.stroke();


  ctx.globalAlpha =
    pulse * 0.8;


  ctx.strokeStyle =
    "#ffffff";


  ctx.lineWidth =
    1;


  ctx.beginPath();


  ctx.moveTo(
    0,
    0
  );


  ctx.lineTo(
    length,
    0
  );


  ctx.stroke();


  ctx.restore();
}


/*=========================================
          DRAW LASER TRAILS
=========================================*/

function drawLaserTrails() {
  const length =
    Math.max(
      Game.width,
      Game.height
    ) *
    2;


  for (
    const trail of
    LaserTrails
  ) {
    ctx.save();


    ctx.translate(
      trail.x,
      trail.y
    );


    ctx.rotate(
      trail.angle
    );


    ctx.globalAlpha =
      trail.life *
      0.55;


    ctx.strokeStyle =
      "#ff2b72";


    ctx.lineWidth =
      trail.width *
      0.7;


    ctx.shadowBlur =
      25;


    ctx.shadowColor =
      "#ff2b72";


    ctx.beginPath();


    ctx.moveTo(
      0,
      0
    );


    ctx.lineTo(
      length,
      0
    );


    ctx.stroke();


    ctx.restore();
  }
}


/*=========================================
        DRAW ACTIVE LASER
=========================================*/

function drawActiveLaser(
  boss
) {
  const length =
    Math.max(
      Game.width,
      Game.height
    ) *
    2;


  ctx.save();


  ctx.translate(
    boss.x,
    boss.y
  );


  ctx.rotate(
    BossLaser.angle
  );


  /* OUTER GLOW */

  ctx.globalAlpha =
    0.35;


  ctx.strokeStyle =
    "#ff2b72";


  ctx.lineWidth =
    BossLaser.width *
    2.4;


  ctx.shadowBlur =
    60;


  ctx.shadowColor =
    "#ff2b72";


  ctx.beginPath();


  ctx.moveTo(
    0,
    0
  );


  ctx.lineTo(
    length,
    0
  );


  ctx.stroke();


  /* MAIN BEAM */

  ctx.globalAlpha =
    1;


  ctx.strokeStyle =
    "#ff2b72";


  ctx.lineWidth =
    BossLaser.width;


  ctx.shadowBlur =
    40;


  ctx.shadowColor =
    "#ff2b72";


  ctx.beginPath();


  ctx.moveTo(
    0,
    0
  );


  ctx.lineTo(
    length,
    0
  );


  ctx.stroke();


  /* WHITE CORE */

  ctx.strokeStyle =
    "#ffffff";


  ctx.lineWidth =
    BossLaser.width *
    0.32;


  ctx.shadowBlur =
    28;


  ctx.shadowColor =
    "#ffffff";


  ctx.beginPath();


  ctx.moveTo(
    0,
    0
  );


  ctx.lineTo(
    length,
    0
  );


  ctx.stroke();


  ctx.restore();
}


/*=========================================
             DRAW SYSTEM
=========================================*/

function drawBossLaser(
  boss
) {
  if (
    !boss ||
    boss.dead
  ) {
    return;
  }


  drawLaserTrails();


  if (
    BossLaser.warning
  ) {
    drawLaserWarning(
      boss
    );
  }


  if (
    BossLaser.active
  ) {
    drawActiveLaser(
      boss
    );
  }
}


/*=========================================
              RESET
=========================================*/

function resetBossLaser() {
  BossLaser.active =
    false;


  BossLaser.warning =
    false;


  BossLaser.angle =
    0;


  BossLaser.timer =
    0;


  BossLaser.warningTimer =
    0;


  BossLaser.width =
    24;


  BossLaser.sweepDirection =
    1;


  BossLaser.sweepSpeed =
    1.1;


  BossLaser.chargeGlow =
    0;


  LaserTrails.length =
    0;
}