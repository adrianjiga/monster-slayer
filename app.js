const GAME_CONFIG = {
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

const GAME_ACTORS = {
  PLAYER: "player",
  MONSTER: "monster",
};

const ACTION_TYPES = {
  ATTACK: "attack",
  HEAL: "heal",
};

const GAME_OUTCOMES = {
  PLAYER: "player",
  MONSTER: "monster",
  DRAW: "draw",
};

function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const app = Vue.createApp({
  data() {
    return {
      playerHealth: GAME_CONFIG.MAX_HEALTH,
      monsterHealth: GAME_CONFIG.MAX_HEALTH,
      currentRound: 0,
      winner: null,
      logMessages: [],
      logIdCounter: 0,
    };
  },
  computed: {
    monsterBarStyles() {
      return this.healthBarStyle(this.monsterHealth);
    },
    playerBarStyles() {
      return this.healthBarStyle(this.playerHealth);
    },
    isSpecialAttackDisabled() {
      return this.currentRound % GAME_CONFIG.SPECIAL_ATTACK_INTERVAL !== 0;
    },
    maxHealth() {
      return GAME_CONFIG.MAX_HEALTH;
    },
  },
  watch: {
    playerHealth() {
      this.checkWinner();
    },
    monsterHealth() {
      this.checkWinner();
    },
  },
  methods: {
    healthBarStyle(health) {
      return { width: Math.max(0, health) + "%" };
    },
    checkWinner() {
      if (this.playerHealth <= 0 && this.monsterHealth <= 0) {
        this.winner = GAME_OUTCOMES.DRAW;
      } else if (this.playerHealth <= 0) {
        this.winner = GAME_OUTCOMES.MONSTER;
      } else if (this.monsterHealth <= 0) {
        this.winner = GAME_OUTCOMES.PLAYER;
      }
    },
    startGame() {
      this.playerHealth = GAME_CONFIG.MAX_HEALTH;
      this.monsterHealth = GAME_CONFIG.MAX_HEALTH;
      this.winner = null;
      this.currentRound = 0;
      this.logMessages = [];
      this.logIdCounter = 0;
    },
    takeTurn(playerAction) {
      this.currentRound++;
      playerAction();
      this.attackPlayer();
    },
    performPlayerAttack(min, max) {
      const attackDamage = getRandomValue(min, max);
      this.monsterHealth -= attackDamage;
      this.addLogMessage(GAME_ACTORS.PLAYER, ACTION_TYPES.ATTACK, attackDamage);
    },
    attackMonster() {
      this.takeTurn(() => {
        this.performPlayerAttack(GAME_CONFIG.PLAYER_ATTACK_MIN, GAME_CONFIG.PLAYER_ATTACK_MAX);
      });
    },
    attackPlayer() {
      const attackDamage = getRandomValue(
        GAME_CONFIG.MONSTER_ATTACK_MIN,
        GAME_CONFIG.MONSTER_ATTACK_MAX
      );
      this.playerHealth -= attackDamage;
      this.addLogMessage(GAME_ACTORS.MONSTER, ACTION_TYPES.ATTACK, attackDamage);
    },
    specialAttackMonster() {
      this.takeTurn(() => {
        this.performPlayerAttack(GAME_CONFIG.SPECIAL_ATTACK_MIN, GAME_CONFIG.SPECIAL_ATTACK_MAX);
      });
    },
    healPlayer() {
      this.takeTurn(() => {
        const healValue = getRandomValue(GAME_CONFIG.HEAL_MIN, GAME_CONFIG.HEAL_MAX);
        this.playerHealth = Math.min(
          GAME_CONFIG.MAX_HEALTH,
          this.playerHealth + healValue
        );
        this.addLogMessage(GAME_ACTORS.PLAYER, ACTION_TYPES.HEAL, healValue);
      });
    },
    surrender() {
      this.winner = GAME_OUTCOMES.MONSTER;
    },
    getActorLabel(actor) {
      return actor === GAME_ACTORS.PLAYER ? "Player" : "Monster";
    },
    addLogMessage(player, action, value) {
      this.logMessages.unshift({
        id: ++this.logIdCounter,
        actionBy: player,
        actionType: action,
        actionValue: value,
      });
    },
  },
});

app.mount("#game");
