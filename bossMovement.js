"use strict";

/*=========================================
      NEON RIFT — BOSS MOVEMENT
=========================================*/

/*
  Handles:
  - smooth orbit movement
  - side sweeps
  - rage movement
  - charge preparation
  - arena positioning
*/


function updateVoidTitanMovement(
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
      boss.rage
        ? 2.2
        : boss.phase === 2
          ? 1.45
          : 1
    );


  /*=========================================
            BASE POSITION
  =========================================*/

  const centerX =
    Game.width / 2;

  const centerY =
    Math.min(
      210,
      Game.height * 0.24
    );


  /*=========================================
          PHASE 1 MOVEMENT
  =========================================*/

  if (boss.phase === 1) {
    const targetX =
      centerX +
      Math.sin(
        boss.moveAngle
      ) *
      240;

    const targetY =
      centerY +
      Math.sin(
        boss.moveAngle *
        0.65
      ) *
      45;

    boss.x +=
      (
        targetX -
        boss.x
      ) *
      deltaTime *
      2;

    boss.y +=
      (
        targetY -
        boss.y
      ) *
      deltaTime *
      2;
  }


  /*=========================================
          PHASE 2 MOVEMENT
  =========================================*/

  if (boss.phase === 2) {
    const targetX =
      centerX +
      Math.sin(
        boss.moveAngle
      ) *
      320;

    const targetY =
      centerY +
      Math.cos(
        boss.moveAngle *
        1.25
      ) *
      70;

    boss.x +=
      (
        targetX -
        boss.x
      ) *
      deltaTime *
      2.5;

    boss.y +=
      (
        targetY -
        boss.y
      ) *
      deltaTime *
      2.5;
  }


  /*=========================================
          PHASE 3 / RAGE
  =========================================*/

  if (boss.phase === 3) {
    const targetX =
      centerX +
      Math.sin(
        boss.moveAngle *
        1.6
      ) *
      380;

    const targetY =
      centerY +
      Math.cos(
        boss.moveAngle *
        2
      ) *
      95;

    boss.x +=
      (
        targetX -
        boss.x
      ) *
      deltaTime *
      3.2;

    boss.y +=
      (
        targetY -
        boss.y
      ) *
      deltaTime *
      3.2;


    /*
      Rage phase constantly emits
      small particles.
    */

    if (
      Math.random() <
      0.35
    ) {
      createParticles(
        boss.x,
        boss.y,
        Math.random() >
        0.5
          ? "#ff2b72"
          : "#ffffff",
        2,
        80
      );
    }
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
        Game.height *
        0.48,
        boss.y
      )
    );
}


/*=========================================
          CHARGE PREPARATION
=========================================*/

function prepareVoidTitanCharge(
  boss
) {
  if (
    !boss ||
    boss.dead
  ) {
    return;
  }


  boss.chargeAngle =
    Math.atan2(
      player.y -
      boss.y,

      player.x -
      boss.x
    );


  boss.chargeTelegraph =
    0.7;


  boss.chargeReady =
    true;


  Camera.shake =
    Math.max(
      Camera.shake,
      10
    );


  createShockwave(
    boss.x,
    boss.y,
    "#ff2b72",
    20,
    160
  );


  if (
    typeof showBossMessage ===
    "function"
  ) {
    showBossMessage(
      "TITAN CHARGE LOCKED"
    );
  }
}


/*=========================================
            CHARGE UPDATE
=========================================*/

function updateVoidTitanCharge(
  boss,
  deltaTime
) {
  if (
    !boss ||
    !boss.chargeReady
  ) {
    return;
  }


  if (
    boss.chargeTelegraph >
    0
  ) {
    boss.chargeTelegraph -=
      deltaTime;

    return;
  }


  /*
    Actual dash
  */

  const chargeSpeed =
    boss.phase === 3
      ? 880
      : 720;


  boss.x +=
    Math.cos(
      boss.chargeAngle
    ) *
    chargeSpeed *
    deltaTime;


  boss.y +=
    Math.sin(
      boss.chargeAngle
    ) *
    chargeSpeed *
    deltaTime;


  createTrail(
    boss.x,
    boss.y,
    boss.phase === 3
      ? 70
      : 55,
    "#ff2b72"
  );


  Camera.shake =
    Math.max(
      Camera.shake,
      12
    );


  /*
    Stop charge when it leaves
    a safe arena region.
  */

  if (
    boss.x <
    -boss.radius ||
    boss.x >
    Game.width +
    boss.radius ||
    boss.y <
    -boss.radius ||
    boss.y >
    Game.height +
    boss.radius
  ) {
    boss.chargeReady =
      false;

    boss.x =
      Game.width / 2;

    boss.y =
      Math.min(
        190,
        Game.height * 0.23
      );

    createShockwave(
      boss.x,
      boss.y,
      "#ffffff",
      20,
      220
    );
  }
}