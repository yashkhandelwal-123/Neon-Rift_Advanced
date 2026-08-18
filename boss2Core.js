"use strict";

/*=========================================
      NEON RIFT — BOSS 2 CORE
         CRIMSON WARDEN
=========================================*/

const Boss2System = {
  active: false,
  warningActive: false,
  warningTimer: 0,

  spawned: false,
  defeated: false,

  spawnTime: 90,

  phase: 1,
  cinematic: false
};

let CrimsonWarden = null;


/*=========================================
        CRIMSON WARDEN CLASS
=========================================*/

class CrimsonWardenCore {

  constructor() {

    /* POSITION */

    this.x =
      Game.width / 2;

    this.y =
      Game.height / 2;


    /* SIZE */

    this.radius = 72;


    /* HEALTH */

    this.maximumHealth = 2000;

    this.health =
      this.maximumHealth;


    /* STATE */

    this.dead = false;

    this.phase = 1;

    this.rage = false;

    this.invincible = false;

    this.entering = true;


    /* MOVEMENT */

    this.moveAngle = 0;

    this.speed = 170;


    /* ATTACK TIMERS */

    this.attackTimer = 2.2;

    this.specialTimer = 6;

    this.teleportTimer = 5;


    /* VISUALS */

    this.rotation = 0;

    this.pulse = 0;

    this.flash = 0;


    /* INTRO */

    this.introTimer = 2.2;

    this.introScale = 0.1;
  }


  /*=========================================
            UPDATE CORE
  =========================================*/

  updateCore(deltaTime) {

    if (this.dead) {
      return;
    }


    this.rotation +=
      deltaTime *
      (
        this.phase === 3
          ? 2.4
          : 1.2
      );


    this.pulse +=
      deltaTime *
      (
        this.phase === 3
          ? 8
          : 5
      );


    this.flash =
      Math.max(
        0,
        this.flash -
        deltaTime * 4
      );


    this.updatePhase();


    /* INTRO */

    if (this.entering) {

      this.updateEntrance(
        deltaTime
      );

      return;
    }


    /* MOVEMENT */

    if (
      typeof updateCrimsonWardenMovement ===
      "function"
    ) {
      updateCrimsonWardenMovement(
        this,
        deltaTime
      );
    }


    /* ATTACKS */

    if (
      typeof updateCrimsonWardenAttacks ===
      "function"
    ) {
      updateCrimsonWardenAttacks(
        this,
        deltaTime
      );
    }
  }


  /*=========================================
            RIFT ENTRANCE
  =========================================*/

  updateEntrance(deltaTime) {

    this.introTimer -=
      deltaTime;


    this.introScale +=
      (
        1 -
        this.introScale
      ) *
      deltaTime *
      4;


    Camera.shake =
      Math.max(
        Camera.shake,
        4
      );


    if (
      Math.random() < 0.45
    ) {
      createParticles(
        this.x,
        this.y,
        Math.random() > 0.5
          ? "#ff174f"
          : "#ff8a00",
        3,
        220
      );
    }


    if (
      this.introTimer <= 0
    ) {

      this.entering =
        false;


      this.introScale =
        1;


      Camera.shake =
        34;


      createShockwave(
        this.x,
        this.y,
        "#ff174f",
        35,
        800
      );


      createShockwave(
        this.x,
        this.y,
        "#ff8a00",
        60,
        1100
      );


      createParticles(
        this.x,
        this.y,
        "#ff174f",
        150,
        700
      );


      createParticles(
        this.x,
        this.y,
        "#ff8a00",
        100,
        650
      );


      if (
        typeof createImpactFX ===
        "function"
      ) {
        createImpactFX(
          this.x,
          this.y,
          "#ff174f",
          6
        );
      }


      if (
        typeof showBoss2Message ===
        "function"
      ) {
        showBoss2Message(
          "CRIMSON WARDEN ONLINE"
        );
      }
    }
  }


  /*=========================================
              PHASES
  =========================================*/

  updatePhase() {

    const ratio =
      this.health /
      this.maximumHealth;


    let newPhase = 1;


    if (
      ratio <= 0.25
    ) {

      newPhase = 3;

    } else if (
      ratio <= 0.55
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


    Boss2System.phase =
      newPhase;


    this.phaseTransition();
  }


  phaseTransition() {

    this.invincible =
      true;


    Camera.shake =
      this.phase === 3
        ? 42
        : 26;


    createShockwave(
      this.x,
      this.y,
      this.phase === 3
        ? "#ffffff"
        : "#ff174f",
      40,
      this.phase === 3
        ? 1000
        : 650
    );


    createParticles(
      this.x,
      this.y,
      this.phase === 3
        ? "#ffffff"
        : "#ff174f",
      this.phase === 3
        ? 220
        : 120,
      this.phase === 3
        ? 900
        : 600
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
          : "#ff174f",
        this.phase === 3
          ? 7
          : 4
      );
    }


    if (
      this.phase === 2 &&
      typeof showBoss2Message ===
        "function"
    ) {
      showBoss2Message(
        "CRIMSON WARDEN // PHASE 2"
      );
    }


    if (
      this.phase === 3
    ) {

      this.rage =
        true;


      if (
        typeof showBoss2Message ===
        "function"
      ) {
        showBoss2Message(
          "⚠ WARDEN OVERHEAT ⚠"
        );
      }
    }


    setTimeout(
      () => {

        if (
          !this.dead
        ) {
          this.invincible =
            false;
        }

      },
      900
    );
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


    this.flash = 1;


    if (
      typeof createImpactFX ===
      "function"
    ) {
      createImpactFX(
        this.x,
        this.y,
        "#ff174f",
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

    if (
      this.dead
    ) {
      return;
    }


    this.dead =
      true;


    Boss2System.active =
      false;


    Boss2System.defeated =
      true;


    Game.score +=
      50000 *
      Game.combo;


    if (
      typeof addXP ===
      "function"
    ) {
      addXP(
        600
      );
    }


    Camera.shake =
      50;


    createParticles(
      this.x,
      this.y,
      "#ffffff",
      240,
      900
    );


    createParticles(
      this.x,
      this.y,
      "#ff174f",
      260,
      1000
    );


    createParticles(
      this.x,
      this.y,
      "#ff8a00",
      180,
      850
    );


    createShockwave(
      this.x,
      this.y,
      "#ffffff",
      50,
      1200
    );


    createShockwave(
      this.x,
      this.y,
      "#ff174f",
      80,
      1500
    );


    if (
      typeof createImpactFX ===
      "function"
    ) {
      createImpactFX(
        this.x,
        this.y,
        "#ffffff",
        8
      );
    }


    if (
      typeof showBoss2Message ===
      "function"
    ) {
      showBoss2Message(
        "CRIMSON WARDEN DESTROYED"
      );
    }
  }
}


/*=========================================
          BOSS 2 WARNING
=========================================*/

function beginBoss2Warning() {

  if (
    Boss2System.spawned ||
    Boss2System.warningActive
  ) {
    return;
  }


  Boss2System.warningActive =
    true;


  Boss2System.cinematic =
    true;


  Boss2System.warningTimer =
    3;


  Camera.shake =
    Math.max(
      Camera.shake,
      16
    );


  if (
    typeof showBoss2Intro ===
    "function"
  ) {
    showBoss2Intro();
  }
}


/*=========================================
            SPAWN BOSS 2
=========================================*/

function spawnCrimsonWarden() {

  Boss2System.warningActive =
    false;


  Boss2System.cinematic =
    false;


  Boss2System.active =
    true;


  Boss2System.spawned =
    true;


  Boss2System.defeated =
    false;


  Boss2System.phase =
    1;


  CrimsonWarden =
    new CrimsonWardenCore();


  if (
    typeof Enemies !==
    "undefined"
  ) {
    Enemies.length = 0;
  }


  Camera.shake =
    24;
}


/*=========================================
          RESET BOSS 2 CORE
=========================================*/

function resetBoss2Core() {

  Boss2System.active =
    false;


  Boss2System.warningActive =
    false;


  Boss2System.warningTimer =
    0;


  Boss2System.spawned =
    false;


  Boss2System.defeated =
    false;


  Boss2System.phase =
    1;


  Boss2System.cinematic =
    false;


  CrimsonWarden =
    null;
}