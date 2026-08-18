"use strict";

/*=========================================
           NEON RIFT PLAYER
=========================================*/

class Player {
  constructor() {

    /*=========================
           POSITION
    =========================*/

    this.x =
      window.innerWidth / 2;

    this.y =
      window.innerHeight / 2;


    /*=========================
           MOVEMENT
    =========================*/

    this.radius = 16;

    this.speed = 340;

    this.aimAngle = 0;


    /*=========================
            HEALTH
    =========================*/

    this.maximumHealth = 100;

    this.health =
      this.maximumHealth;


    /*=========================
             DASH
    =========================*/

    this.energy = 100;

    this.dashCost = 25;

    this.dashing = false;

    this.dashTimer = 0;

    this.dashCooldown = 0;

    this.invincibleTimer = 0;


    /*=========================
          OVERDRIVE
    =========================*/

    this.overdrive = 0;

    this.overdriveActive = false;

    this.overdriveTimer = 0;
  }


  /*=========================
             RESET
  =========================*/

  reset() {

    this.x =
      Game.width / 2;

    this.y =
      Game.height / 2;


    this.speed = 340;


    this.maximumHealth = 100;

    this.health =
      this.maximumHealth;


    this.energy = 100;

    this.dashCost = 25;


    this.dashing = false;

    this.dashTimer = 0;

    this.dashCooldown = 0;

    this.invincibleTimer = 0;


    this.overdrive = 0;

    this.overdriveActive = false;

    this.overdriveTimer = 0;


    this.aimAngle = 0;
  }


  /*=========================
              DASH
  =========================*/

  dash() {

    if (
      !Game.running ||
      Game.paused ||
      this.dashing ||
      this.dashCooldown > 0
    ) {
      return;
    }


    /*
      During Overdrive,
      dash does NOT require energy.
    */

    if (
      !this.overdriveActive &&
      this.energy <
        this.dashCost
    ) {
      return;
    }


    this.dashing = true;

    this.dashTimer = 0.18;

    this.dashCooldown =
      this.overdriveActive
        ? 0.35
        : 1;


    /*
      Free dash while
      Overdrive is active.
    */

    if (
      !this.overdriveActive
    ) {

      this.energy -=
        this.dashCost;

    }


    /*
      Dash gives temporary
      invincibility.
    */

    this.invincibleTimer =
      Math.max(
        this.invincibleTimer,
        0.24
      );


    Camera.shake =
      this.overdriveActive
        ? 18
        : 12;


    /* DASH PARTICLES */

    createParticles(
      this.x,
      this.y,
      this.overdriveActive
        ? "#ff2b72"
        : "#00f7ff",
      this.overdriveActive
        ? 55
        : 34,
      this.overdriveActive
        ? 500
        : 380
    );


    /* DASH SHOCKWAVE */

    createShockwave(
      this.x,
      this.y,
      this.overdriveActive
        ? "#ff2b72"
        : "#00f7ff",
      15,
      this.overdriveActive
        ? 260
        : 180
    );
  }


  /*=========================
            UPDATE
  =========================*/

  update(deltaTime) {

    let moveX = 0;

    let moveY = 0;

    if (this.overdriveActive) {
  createAfterImage(this);
}


    /*=========================
           MOVEMENT INPUT
    =========================*/

    if (
      Keys.w ||
      Keys.arrowup
    ) {
      moveY -= 1;
    }


    if (
      Keys.s ||
      Keys.arrowdown
    ) {
      moveY += 1;
    }


    if (
      Keys.a ||
      Keys.arrowleft
    ) {
      moveX -= 1;
    }


    if (
      Keys.d ||
      Keys.arrowright
    ) {
      moveX += 1;
    }


    /* NORMALIZE MOVEMENT */

    if (
      moveX !== 0 ||
      moveY !== 0
    ) {

      const length =
        Math.hypot(
          moveX,
          moveY
        );


      moveX /= length;

      moveY /= length;
    }


    /*=========================
            AIM
    =========================*/

    this.aimAngle =
      Math.atan2(
        Mouse.y - this.y,
        Mouse.x - this.x
      );


    /*=========================
          MOVEMENT SPEED
    =========================*/

    const currentSpeed =
      this.dashing
        ? this.speed * 3.5
        : this.overdriveActive
          ? this.speed * 1.15
          : this.speed;


    this.x +=
      moveX *
      currentSpeed *
      deltaTime;


    this.y +=
      moveY *
      currentSpeed *
      deltaTime;


    /*=========================
          SCREEN BOUNDS
    =========================*/

    this.x =
      Math.max(
        this.radius,
        Math.min(
          Game.width -
            this.radius,
          this.x
        )
      );


    this.y =
      Math.max(
        this.radius,
        Math.min(
          Game.height -
            this.radius,
          this.y
        )
      );


    /*=========================
          DASH TIMER
    =========================*/

    if (this.dashing) {

      this.dashTimer -=
        deltaTime;


      if (
        this.dashTimer <= 0
      ) {

        this.dashing =
          false;

      }
    }


    this.dashCooldown =
      Math.max(
        0,
        this.dashCooldown -
          deltaTime
      );


    /*=========================
          INVINCIBILITY
    =========================*/

    this.invincibleTimer =
      Math.max(
        0,
        this.invincibleTimer -
          deltaTime
      );


    /*=========================
          ENERGY REGEN
    =========================*/

    if (
      !this.overdriveActive
    ) {

      this.energy =
        Math.min(
          100,
          this.energy +
            deltaTime * 12
        );

    } else {

      /*
        Keep dash meter full-looking
        during Overdrive.
      */

      this.energy =
        Math.min(
          100,
          this.energy +
            deltaTime * 40
        );

    }


    /*=========================
          OVERDRIVE TIMER
    =========================*/

    if (
      this.overdriveActive
    ) {

      this.overdriveTimer -=
        deltaTime;


      if (
        this.overdriveTimer <= 0
      ) {

        this.endOverdrive();

      }
    }


    /*=========================
           PLAYER TRAIL
    =========================*/

    createTrail(
      this.x,
      this.y,

      this.overdriveActive
        ? 28
        : this.dashing
          ? 24
          : 14,

      this.overdriveActive
        ? "#ff2b72"
        : this.dashing
          ? "#ffffff"
          : "#00f7ff"
    );
  }


  /*=========================
             DRAW
  =========================*/

  draw() {

    ctx.save();


    ctx.translate(
      this.x,
      this.y
    );


    ctx.rotate(
      this.aimAngle
    );


    /*=========================
           OUTER GLOW
    =========================*/

    const glowRadius =
      this.overdriveActive
        ? 62
        : this.dashing
          ? 52
          : 38;


    const glow =
      ctx.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        glowRadius
      );


    if (
      this.overdriveActive
    ) {

      glow.addColorStop(
        0,
        "rgba(255,255,255,1)"
      );

      glow.addColorStop(
        0.18,
        "rgba(255,43,114,1)"
      );

      glow.addColorStop(
        0.5,
        "rgba(160,40,255,.55)"
      );

      glow.addColorStop(
        1,
        "rgba(255,0,70,0)"
      );

    } else {

      glow.addColorStop(
        0,
        "rgba(255,255,255,1)"
      );

      glow.addColorStop(
        0.2,
        "rgba(0,247,255,.9)"
      );

      glow.addColorStop(
        0.55,
        "rgba(140,60,255,.4)"
      );

      glow.addColorStop(
        1,
        "rgba(0,247,255,0)"
      );

    }


    ctx.fillStyle = glow;


    ctx.beginPath();

    ctx.arc(
      0,
      0,
      glowRadius,
      0,
      Math.PI * 2
    );

    ctx.fill();


    /*=========================
         PLAYER HEXAGON
    =========================*/

    ctx.shadowBlur =
      this.overdriveActive
        ? 45
        : 24;


    ctx.shadowColor =
      this.overdriveActive
        ? "#ff2b72"
        : "#00f7ff";


    ctx.strokeStyle =
      this.overdriveActive
        ? "#ffffff"
        : this.dashing
          ? "#ffffff"
          : "#00f7ff";


    ctx.lineWidth =
      this.overdriveActive
        ? 4
        : 3;


    ctx.beginPath();


    for (
      let i = 0;
      i < 6;
      i++
    ) {

      const angle =
        Math.PI *
        2 *
        i /
        6;


      const x =
        Math.cos(angle) *
        this.radius;


      const y =
        Math.sin(angle) *
        this.radius;


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

    ctx.stroke();


    /*=========================
           AIM POINT
    =========================*/

    ctx.fillStyle =
      "#ffffff";


    ctx.shadowBlur =
      this.overdriveActive
        ? 35
        : 25;


    ctx.shadowColor =
      "#ffffff";


    ctx.beginPath();

    ctx.arc(
      0,
      0,
      this.overdriveActive
        ? 8
        : 6,
      0,
      Math.PI * 2
    );

    ctx.fill();


    /*
      Small nose indicator so
      you can see aim direction.
    */

    ctx.fillStyle =
      this.overdriveActive
        ? "#ff2b72"
        : "#00f7ff";


    ctx.fillRect(
      this.radius + 3,
      -2,
      12,
      4
    );


    ctx.restore();
  }


  /*=========================
          END OVERDRIVE
  =========================*/

  endOverdrive() {

    if (
      !this.overdriveActive
    ) {
      return;
    }


    this.overdriveActive =
      false;


    this.overdriveTimer =
      0;


    createShockwave(
      this.x,
      this.y,
      "#00f7ff",
      20,
      220
    );


    createParticles(
      this.x,
      this.y,
      "#00f7ff",
      35,
      280
    );

  }
}


/*=========================================
          CREATE PLAYER
=========================================*/

const player =
  new Player();


/*=========================================
          PLAYER DAMAGE
=========================================*/

function damagePlayer(amount) {

  if (
    !Game.running ||
    Game.paused ||
    player.invincibleTimer > 0 ||
    player.dashing ||
    player.overdriveActive
  ) {
    return;
  }


  player.health -=
    amount;


  player.invincibleTimer =
    1;


  Game.combo =
    1;


  Camera.shake =
    25;

  triggerOverdriveFX();


  createParticles(
    player.x,
    player.y,
    "#ffffff",
    38,
    340
  );


  createShockwave(
    player.x,
    player.y,
    "#ff2b72",
    18,
    180
  );


  if (
    player.health <= 0
  ) {

    player.health = 0;

    endGame();

  }
}


/*=========================================
          OVERDRIVE UTILITY
=========================================*/

function activateOverdrive() {

  if (
    !Game.running ||
    Game.paused
  ) {
    return;
  }


  if (
    player.overdriveActive
  ) {
    return;
  }


  /*
    Q only works when meter is full.
  */

  if (
    player.overdrive < 100
  ) {
    return;
  }


  player.overdrive =
    0;


  player.overdriveActive =
    true;


  /*
    Duration in gameplay time.
  */

  player.overdriveTimer =
    8;


  /*
    Temporary protection.
  */

  player.invincibleTimer =
    Math.max(
      player.invincibleTimer,
      0.8
    );


  Camera.shake =
    25;


  /*=========================
       ACTIVATION BLAST
  =========================*/

  createParticles(
    player.x,
    player.y,
    "#ff2b72",
    140,
    600
  );


  createParticles(
    player.x,
    player.y,
    "#ffffff",
    60,
    450
  );


  createShockwave(
    player.x,
    player.y,
    "#ff2b72",
    30,
    700
  );


  /*
    Make lightning flash when
    Overdrive begins.
  */

  if (
    typeof World !==
    "undefined"
  ) {

    World.lightningFlash =
      0.8;

  }


  /*
    Destroy nearby normal enemies.
    This makes activation feel huge.
  */

  if (
    typeof Enemies !==
    "undefined"
  ) {

    for (
      const enemy of Enemies
    ) {

      if (
        enemy.dead
      ) {
        continue;
      }


      const distance =
        Math.hypot(
          enemy.x -
            player.x,
          enemy.y -
            player.y
        );


      if (
        distance < 240
      ) {

        enemy.takeDamage(
          999
        );

      }
    }
  }


  /*
    Boss takes a smaller activation hit.
  */

  if (
    typeof voidTitan !==
      "undefined" &&
    voidTitan &&
    !voidTitan.dead
  ) {

    const bossDistance =
      Math.hypot(
        voidTitan.x -
          player.x,
        voidTitan.y -
          player.y
      );


    if (
      bossDistance < 350
    ) {

      voidTitan.takeDamage(
        5
      );

    }
  }
}