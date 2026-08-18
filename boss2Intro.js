"use strict";

/*=========================================
     CRIMSON WARDEN — INTRO SYSTEM
=========================================*/

function showBoss2Intro() {

  /*
    Dark/red flash before
    Crimson Warden arrives.
  */

  Camera.shake =
    Math.max(
      Camera.shake,
      18
    );


  if (
    typeof World !==
    "undefined"
  ) {
    World.lightningFlash =
      0.8;
  }


  /*
    Message
  */

  if (
    typeof showBoss2Message ===
    "function"
  ) {
    showBoss2Message(
      "⚠ UNKNOWN RIFT DETECTED ⚠"
    );
  }


  /*
    Center rift particles
  */

  const x =
    Game.width / 2;

  const y =
    Game.height / 2;


  createParticles(
    x,
    y,
    "#ff174f",
    80,
    500
  );


  createParticles(
    x,
    y,
    "#ff8a00",
    45,
    350
  );


  createShockwave(
    x,
    y,
    "#ff174f",
    20,
    500
  );


  /*
    Second warning pulse
  */

  setTimeout(() => {

    if (
      !Boss2System.warningActive
    ) {
      return;
    }


    Camera.shake =
      Math.max(
        Camera.shake,
        24
      );


    createShockwave(
      Game.width / 2,
      Game.height / 2,
      "#ff8a00",
      35,
      700
    );


    if (
      typeof createImpactFX ===
      "function"
    ) {
      createImpactFX(
        Game.width / 2,
        Game.height / 2,
        "#ff174f",
        4
      );
    }

  }, 1400);
}