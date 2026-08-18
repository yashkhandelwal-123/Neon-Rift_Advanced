"use strict";

const levelUpScreen =
  document.getElementById("levelUpScreen");

const upgradeChoices =
  document.getElementById("upgradeChoices");

const xpBar =
  document.getElementById("xpBar");

const xpText =
  document.getElementById("xpText");

const levelText =
  document.getElementById("levelText");

const UpgradeLevels = {
  rapidFire: 0,
  damage: 0,
  movement: 0,
  maximumHealth: 0,
  bulletSpeed: 0,
  multishot: 0,
  dashEfficiency: 0,
  regeneration: 0
};

const Upgrades = [
  {
    id: "rapidFire",
    icon: "⚡",
    name: "RAPID FIRE",
    description: "Increase firing speed by 18%.",
    maximumLevel: 6,

    apply() {
      Game.fireRateMultiplier *= 1.18;
    }
  },

  {
    id: "damage",
    icon: "💥",
    name: "PLASMA DAMAGE",
    description: "Bullets deal one additional damage.",
    maximumLevel: 5,

    apply() {
      Game.bulletDamage += 1;
    }
  },

  {
    id: "movement",
    icon: "🏃",
    name: "PHASE VELOCITY",
    description: "Increase movement speed by 10%.",
    maximumLevel: 5,

    apply() {
      player.speed *= 1.1;
    }
  },

  {
    id: "maximumHealth",
    icon: "❤️",
    name: "CORE EXPANSION",
    description: "Gain 20 maximum health and fully repair it.",
    maximumLevel: 5,

    apply() {
      player.maximumHealth += 20;
      player.health = player.maximumHealth;
    }
  },

  {
    id: "bulletSpeed",
    icon: "☄️",
    name: "HYPER PROJECTILES",
    description: "Increase bullet speed by 16%.",
    maximumLevel: 5,

    apply() {
      Game.bulletSpeedMultiplier *= 1.16;
    }
  },

  {
    id: "multishot",
    icon: "🔱",
    name: "MULTISHOT",
    description: "Fire one additional projectile.",
    maximumLevel: 4,

    apply() {
      Game.extraBullets += 1;
    }
  },

  {
    id: "dashEfficiency",
    icon: "🌀",
    name: "DASH EFFICIENCY",
    description: "Dashing consumes 4 less energy.",
    maximumLevel: 4,

    apply() {
      player.dashCost = Math.max(
        9,
        player.dashCost - 4
      );
    }
  },

  {
    id: "regeneration",
    icon: "💚",
    name: "CORE REPAIR",
    description: "Restore 35 health immediately.",
    maximumLevel: 99,

    apply() {
      player.health = Math.min(
        player.maximumHealth,
        player.health + 35
      );
    }
  }
];

function addXP(amount) {
  if (!Game.running) return;

  Game.xp += amount;

  while (Game.xp >= Game.xpNeeded) {
    Game.xp -= Game.xpNeeded;
    Game.level += 1;

    Game.xpNeeded = Math.floor(
      Game.xpNeeded * 1.28
    );

    openLevelUpScreen();
    break;
  }

  updateXPInterface();
}

function updateXPInterface() {
  const percentage =
    Game.xp / Game.xpNeeded * 100;

  xpBar.style.width =
    Math.min(100, percentage) + "%";

  xpText.textContent =
    Math.floor(Game.xp) +
    " / " +
    Game.xpNeeded +
    " XP";

  levelText.textContent =
    Game.level;
}

function getRandomUpgrades(amount = 3) {
  const available = Upgrades.filter(
    upgrade =>
      UpgradeLevels[upgrade.id] <
      upgrade.maximumLevel
  );

  const shuffled = [...available];

  for (
    let i = shuffled.length - 1;
    i > 0;
    i--
  ) {
    const randomIndex =
      Math.floor(Math.random() * (i + 1));

    [
      shuffled[i],
      shuffled[randomIndex]
    ] = [
      shuffled[randomIndex],
      shuffled[i]
    ];
  }

  return shuffled.slice(0, amount);
}

function openLevelUpScreen() {
  Game.paused = true;

  levelUpScreen.classList.remove("hidden");

  const choices = getRandomUpgrades(3);

  upgradeChoices.innerHTML = "";

  for (const upgrade of choices) {
    const button =
      document.createElement("button");

    button.className = "upgrade-option";

    const currentLevel =
      UpgradeLevels[upgrade.id];

    button.innerHTML = `
      <span class="upgrade-icon">
        ${upgrade.icon}
      </span>

      <span class="upgrade-name">
        ${upgrade.name}
      </span>

      <span class="upgrade-description">
        ${upgrade.description}
      </span>

      <span class="upgrade-level">
        LEVEL ${currentLevel + 1}
        /
        ${
          upgrade.maximumLevel === 99
            ? "∞"
            : upgrade.maximumLevel
        }
      </span>
    `;

    button.addEventListener(
      "click",
      () => selectUpgrade(upgrade)
    );

    upgradeChoices.appendChild(button);
  }
}

function selectUpgrade(upgrade) {
  UpgradeLevels[upgrade.id] += 1;

  upgrade.apply();

  levelUpScreen.classList.add("hidden");

  Game.paused = false;

  createParticles(
    player.x,
    player.y,
    "#ffe600",
    60,
    420
  );

  createShockwave(
    player.x,
    player.y,
    "#ffe600",
    20,
    300
  );

  Camera.shake = 14;

  updateXPInterface();
}

function resetUpgradeSystem() {
  Game.level = 1;
  Game.xp = 0;
  Game.xpNeeded = 100;

  Game.fireRateMultiplier = 1;
  Game.bulletDamage = 1;
  Game.bulletSpeedMultiplier = 1;
  Game.extraBullets = 0;

  for (const upgrade in UpgradeLevels) {
    UpgradeLevels[upgrade] = 0;
  }

  levelUpScreen.classList.add("hidden");

  updateXPInterface();
}