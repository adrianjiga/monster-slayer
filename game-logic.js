export const GAME_CONFIG = {
  PLAYER_ATTACK_MIN: 5,
  PLAYER_ATTACK_MAX: 12,
  MONSTER_ATTACK_MIN: 8,
  MONSTER_ATTACK_MAX: 13,
  SPECIAL_ATTACK_MIN: 10,
  SPECIAL_ATTACK_MAX: 25,
  HEAL_MIN: 8,
  HEAL_MAX: 20,
  MAX_HEALTH: 100,
  SPECIAL_ATTACK_INTERVAL: 3,
};

export const GAME_ACTORS = {
  PLAYER: "player",
  MONSTER: "monster",
};

export const ACTION_TYPES = {
  ATTACK: "attack",
  HEAL: "heal",
};

export const GAME_OUTCOMES = {
  PLAYER: "player",
  MONSTER: "monster",
  DRAW: "draw",
};

export function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function healthBarStyle(health) {
  return { width: Math.max(0, health) + "%" };
}

export function getActorLabel(actor) {
  return actor === GAME_ACTORS.PLAYER ? "Player" : "Monster";
}

export function shouldDisableSpecialAttack(currentRound) {
  return currentRound % GAME_CONFIG.SPECIAL_ATTACK_INTERVAL !== 0;
}

export function determineWinner(playerHealth, monsterHealth) {
  if (playerHealth <= 0 && monsterHealth <= 0) return GAME_OUTCOMES.DRAW;
  if (playerHealth <= 0) return GAME_OUTCOMES.MONSTER;
  if (monsterHealth <= 0) return GAME_OUTCOMES.PLAYER;
  return null;
}
