"use strict";

/*=========================================
     CRIMSON WARDEN — MOVEMENT SYSTEM
=========================================*/

function updateCrimsonWardenMovement(
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

  boss.moveAngle +=
    deltaTime *
    (
      boss.phase === 3
        ? 3.2
        : boss.phase === 2
          ? 2.2
          : 1.4
    );


  /*=========================================
            TELEPORT TIMER
  =========================================*/

  boss.teleportTimer -=
    deltaTime;


  if (
    boss.teleportTimer <= 0
  ) {
    teleportCrimsonWarden(
      boss
    );

    boss.teleportTimer =
      boss.phase === 3
        ? 2.2
        : boss.phase === 2
          ? 3.2
          : 4.4;
  }


  /*=========================================
          NORMAL MOVEMENT
  =========================================*/

  const centerX =
    Game.width / 2;

  const centerY =
    Game.height * 0.28;


  const horizontalRange =
    boss.phase === 3
      ? 360
      : boss.phase === 2
        ? 300
        : 240;


  const verticalRange =
    boss.phase === 3
      ? 110
      : boss.phase === 2
        ? 85
        : 55;


  const targetX =
    centerX +
    Math.sin(
      boss.moveAngle
    ) *
    horizontalRange;


  const targetY =
    centerY +
    Math.cos(
      boss.moveAngle *
      1.35
    ) *
    verticalRange;


  boss.x +=
    (
      targetX -
      boss.x
    ) *
    deltaTime *
    (
      boss.phase === 3
        ? 4
        : boss.phase === 2
          ? 3.2
          : 2.4
    );


  boss.y +=
    (
      targetY -
      boss.y
    ) *
    deltaTime *
    (
      boss.phase === 3
        ? 4
        : boss.phase === 2
          ? 3.2
          : 2.4
    );


  /*=========================================
            RAGE TRAIL
  =========================================*/

  if (
    boss.phase === 3 &&
    Math.random() < 0.4
  ) {
    createParticles(
      boss.x,
      boss.y,
      Math.random() > 0.5
        ? "#ff174f"
        : "#ff8a00",
      2,
      120
    );
  }


  /*=========================================
          KEEP IN ARENA
  =========================================*/

  boss.x =
    Math.max(
      boss.radius + 20,
      Math.min(
        Game.width -
        boss.radius -
        20,
        boss.x
      )
    );


  boss.y =
    Math.max(
      boss.radius + 20,
      Math.min(
        Game.height * 0.55,
        boss.y
      )
    );
}


/*=========================================
           TELEPORT
=========================================*/

function teleportCrimsonWarden(
  boss
) {
  if (
    !boss ||
    boss.dead
  ) {
    return;
  }


  const oldX =
    boss.x;

  const oldY =
    boss.y;


  /* EXIT FX */

  createParticles(
    oldX,
    oldY,
    "#ff174f",
    45,
    360
  );


  createShockwave(
    oldX,
    oldY,
    "#ff174f",
    15,
    180
  );


  /* NEW POSITION */

  const margin =
    120;


  boss.x =
    margin +
    Math.random() *
    Math.max(
      100,
      Game.width -
      margin * 2
    );


  boss.y =
    120 +
    Math.random() *
    Math.max(
      100,
      Game.height *
      0.42
    );


  /* ENTRY FX */

  createParticles(
    boss.x,
    boss.y,
    "#ff8a00",
    55,
    420
  );


  createShockwave(
    boss.x,
    boss.y,
    "#ff8a00",
    20,
    220
  );


  Camera.shake =
    Math.max(
      Camera.shake,
      boss.phase === 3
        ? 14
        : 9
    );


  if (
    typeof createImpactFX ===
    "function"
  ) {
    createImpactFX(
      boss.x,
      boss.y,
      "#ff174f",
      boss.phase === 3
        ? 2.5
        : 1.5
    );
  }
}