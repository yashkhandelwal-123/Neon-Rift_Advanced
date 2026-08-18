"use strict";

/*=========================================
        NEON RIFT — BOSS CORE
=========================================*/

/*
  This file handles:
  - Boss system state
  - Boss health
  - Boss phases
  - Boss damage
  - Boss spawning
  - Boss death
*/


const BossSystemV2 = {
  cinematic: false,
  active: false,
  warningActive: false,
  warningTimer: 0,

  spawned: false,
  defeated: false,

  spawnTime: 30,

  phase: 1
};


let VoidTitanV2 = null;


/*=========================================
          VOID TITAN CLASS
=========================================*/

class VoidTitanCore {

  constructor() {

    /* POSITION */

    this.x =
      Game.width / 2;

    this.y =
      -180;


    /* SIZE */

    this.radius = 86;


    /* HEALTH */

    this.maximumHealth = 1200;

    this.health =
      this.maximumHealth;


    /* STATE */

    this.dead = false;

    this.phase = 1;

    this.rage = false;

    this.invincible = false;


    /* MOVEMENT */

    this.moveAngle = 0;

    this.speed = 110;


    /* ATTACK TIMERS */

    this.attackTimer = 2.5;

    this.specialTimer = 7;

    this.laserTimer = 10;


    /* VISUALS */

    this.rotation = 0;

    this.pulse = 0;

    this.flash = 0;


    /* ENTRANCE */

    this.entering = true;

    this.targetY =
      Math.min(
        190,
        Game.height * 0.23
      );
  }


  /*=========================================
              UPDATE CORE
  =========================================*/

  updateCore(deltaTime) {

    if (this.dead) {
      return;
    }


    this.rotation +=
      deltaTime * 0.8;


    this.pulse +=
      deltaTime * 4;


    this.flash =
      Math.max(
        0,
        this.flash -
        deltaTime * 4
      );


    this.updatePhase();


    if (this.entering) {

      this.updateEntrance(
        deltaTime
      );

      return;
    }


    /*
      Movement and attack functions
      will come from the other boss files.
    */

    if (
      typeof updateVoidTitanMovement ===
      "function"
    ) {

      updateVoidTitanMovement(
        this,
        deltaTime
      );
    }


    if (
      typeof updateVoidTitanAttacks ===
      "function"
    ) {

      updateVoidTitanAttacks(
        this,
        deltaTime
      );
    }


    if (
      typeof updateVoidTitanLaser ===
      "function"
    ) {

      updateVoidTitanLaser(
        this,
        deltaTime
      );
    }
  }


  /*=========================================
             ENTRANCE
  =========================================*/

  updateEntrance(deltaTime) {

  /*
    Titan falls from above
    like a meteor.
  */

  const fallSpeed =
    520;

  this.y +=
    fallSpeed *
    deltaTime;


  /*
    Burning trail while falling
  */

  createTrail(
    this.x,
    this.y,
    70,
    "#ff2b72"
  );


  if (
    Math.random() < 0.7
  ) {

    createParticles(
      this.x,
      this.y - 40,
      Math.random() > 0.5
        ? "#ff2b72"
        : "#ffffff",
      4,
      180
    );

  }


  /*
    Small camera shake while
    Titan approaches.
  */

  Camera.shake =
    Math.max(
      Camera.shake,
      5
    );


  /*
    IMPACT
  */

  if (
    this.y >=
    this.targetY
  ) {

    this.y =
      this.targetY;

    this.entering =
      false;


    Camera.shake =
      38;


    /*
      Huge impact particles
    */

    createParticles(
      this.x,
      this.y,
      "#ff2b72",
      180,
      850
    );

    createParticles(
      this.x,
      this.y,
      "#ffffff",
      100,
      650
    );


    /*
      Giant shockwave
    */

    createShockwave(
      this.x,
      this.y,
      "#ffffff",
      35,
      900
    );

    createShockwave(
      this.x,
      this.y,
      "#ff2b72",
      60,
      1200
    );


    /*
      Heavy impact FX
    */

    if (
      typeof createImpactFX ===
      "function"
    ) {

      createImpactFX(
        this.x,
        this.y,
        "#ff2b72",
        7
      );

    }


    /*
      Lightning flash
    */

    if (
      typeof World !==
      "undefined"
    ) {

      World.lightningFlash =
        1;

    }


    /*
      Boss message
    */

    if (
      typeof showBossMessage ===
      "function"
    ) {

      showBossMessage(
        "VOID TITAN ONLINE"
      );

    }

  }
}


  /*=========================================
              PHASES
  =========================================*/

  updatePhase() {

    const healthRatio =
      this.health /
      this.maximumHealth;


    let newPhase = 1;


    if (
      healthRatio <= 0.25
    ) {

      newPhase = 3;

    } else if (
      healthRatio <= 0.55
    ) {

      newPhase = 2;

    }


    if (
      newPhase ===
      this.phase
    ) {
      return;
    }


    this.phase =
      newPhase;


    BossSystemV2.phase =
      newPhase;


    this.phaseTransition();
  }


  phaseTransition() {

  this.invincible = true;

  Camera.shake = 28;

  createShockwave(
    this.x,
    this.y,
    this.phase === 3
      ? "#ffffff"
      : "#ff2b72",
    35,
    650
  );

  createParticles(
    this.x,
    this.y,
    this.phase === 3
      ? "#ffffff"
      : "#ff2b72",
    130,
    650
  );

  if (
    typeof createImpactFX ===
    "function"
  ) {
    createImpactFX(
      this.x,
      this.y,
      this.phase === 3
        ? "#ffffff"
        : "#ff2b72",
      this.phase === 3
        ? 6
        : 4
    );
  }

  if (
    typeof World !==
    "undefined"
  ) {
    World.lightningFlash =
      this.phase === 3
        ? 1
        : 0.7;
  }

  if (this.phase === 2) {
    if (
      typeof showBossMessage ===
      "function"
    ) {
      showBossMessage(
        "VOID TITAN // PHASE 2"
      );
    }
  }

  if (this.phase === 3) {

    this.rage = true;

    if (
      typeof showBossMessage ===
      "function"
    ) {
      showBossMessage(
        "⚠ RAGE MODE ACTIVATED ⚠"
      );
    }

    if (
      typeof triggerBossRageFX ===
      "function"
    ) {
      triggerBossRageFX();
    }

    createShockwave(
      this.x,
      this.y,
      "#ff2b72",
      60,
      1000
    );

    createParticles(
      this.x,
      this.y,
      "#ffffff",
      180,
      900
    );

    createParticles(
      this.x,
      this.y,
      "#ff2b72",
      220,
      1000
    );

    Camera.shake = 42;
  }

  setTimeout(() => {

    if (!this.dead) {
      this.invincible = false;
    }

  }, 900);
}


  /*=========================================
              DAMAGE
  =========================================*/

  takeDamage(amount) {

    if (
      this.dead ||
      this.invincible
    ) {
      return;
    }


    this.health -=
      amount;


    this.flash =
      1;


    if (
      typeof createImpactFX ===
      "function"
    ) {

      createImpactFX(
        this.x,
        this.y,
        "#ff2b72",
        1.4
      );
    }


    if (
      this.health <= 0
    ) {

      this.health = 0;

      this.destroy();
    }
  }


  /*=========================================
              DEATH
  =========================================*/

  destroy() {

    if (this.dead) {
      return;
    }


    this.dead =
      true;


    BossSystemV2.active =
      false;


    BossSystemV2.defeated =
      true;


    Game.score +=
      25000 *
      Game.combo;


    if (
      typeof addXP ===
      "function"
    ) {

      addXP(350);

    }


    Camera.shake =
      45;


    createParticles(
      this.x,
      this.y,
      "#ffffff",
      200,
      800
    );


    createParticles(
      this.x,
      this.y,
      "#ff2b72",
      220,
      900
    );


    createShockwave(
      this.x,
      this.y,
      "#ffffff",
      40,
      1000
    );


    if (
      typeof createImpactFX ===
      "function"
    ) {

      createImpactFX(
        this.x,
        this.y,
        "#ffffff",
        7
      );
    }


    if (
      typeof World !==
      "undefined"
    ) {

      World.lightningFlash =
        1;
    }


    if (
      typeof showBossMessage ===
      "function"
    ) {

      showBossMessage(
        "VOID TITAN DESTROYED"
      );
    }
  }
}


/*=========================================
           BOSS WARNING
=========================================*/

function beginBossWarningV2() {

  if (
    BossSystemV2.spawned ||
    BossSystemV2.warningActive
  ) {
    return;
  }


  BossSystemV2.warningActive =
    true;

    showBossIntro();
    BossSystemV2.cinematic = true;


  BossSystemV2.warningTimer =
    3;


  Camera.shake =
    Math.max(
      Camera.shake,
      16
    );


  if (
    typeof World !==
    "undefined"
  ) {

    World.lightningFlash =
      0.9;
  }


  if (
    typeof showBossMessage ===
    "function"
  ) {

    showBossMessage(
      "⚠ VOID TITAN APPROACHING ⚠"
    );
  }
}


/*=========================================
           SPAWN BOSS
=========================================*/

function spawnVoidTitanV2() {

    BossSystemV2.cinematic = false;

  BossSystemV2.warningActive =
    false;


  BossSystemV2.active =
    true;


  BossSystemV2.spawned =
    true;


  BossSystemV2.defeated =
    false;


  BossSystemV2.phase =
    1;


  VoidTitanV2 =
    new VoidTitanCore();


  /*
    Clear normal enemies for
    the boss intro.
  */

  if (
    typeof Enemies !==
    "undefined"
  ) {

    Enemies.length = 0;

  }


  createShockwave(
    Game.width / 2,
    0,
    "#ff2b72",
    30,
    800
  );


  Camera.shake =
    30;
}


/*=========================================
          RESET BOSS CORE
=========================================*/

function resetBossCoreV2() {

    BossSystemV2.cinematic = false;

  BossSystemV2.active =
    false;


  BossSystemV2.warningActive =
    false;


  BossSystemV2.warningTimer =
    0;


  BossSystemV2.spawned =
    false;

  BossSystemV2.defeated =
    false;


  BossSystemV2.phase =
    1;


  VoidTitanV2 =
    null;
}

/*=========================================
          BOSS INTRO
=========================================*/

function showBossIntro(){

const intro=
document.getElementById("bossIntro");

if(!intro)return;

intro.classList.remove("hidden");

requestAnimationFrame(()=>{

intro.classList.add("show");

});

setTimeout(()=>{

intro.classList.remove("show");

intro.classList.add("hidden");

},2600);

}