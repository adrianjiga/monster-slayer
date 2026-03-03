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
    mayUseSpecialAttack() {
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
        this.winner = "draw";
      } else if (this.playerHealth <= 0) {
        this.winner = "monster";
      } else if (this.monsterHealth <= 0) {
        this.winner = "player";
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
    attackMonster() {
      this.takeTurn(() => {
        const attackDamage = getRandomValue(
          GAME_CONFIG.PLAYER_ATTACK_MIN,
          GAME_CONFIG.PLAYER_ATTACK_MAX
        );
        this.monsterHealth -= attackDamage;
        this.addLogMessage("player", "attack", attackDamage);
      });
    },
    attackPlayer() {
      const attackDamage = getRandomValue(
        GAME_CONFIG.MONSTER_ATTACK_MIN,
        GAME_CONFIG.MONSTER_ATTACK_MAX
      );
      this.playerHealth -= attackDamage;
      this.addLogMessage("monster", "attack", attackDamage);
    },
    specialAttackMonster() {
      this.takeTurn(() => {
        const attackDamage = getRandomValue(
          GAME_CONFIG.SPECIAL_ATTACK_MIN,
          GAME_CONFIG.SPECIAL_ATTACK_MAX
        );
        this.monsterHealth -= attackDamage;
        this.addLogMessage("player", "attack", attackDamage);
      });
    },
    healPlayer() {
      this.takeTurn(() => {
        const healValue = getRandomValue(GAME_CONFIG.HEAL_MIN, GAME_CONFIG.HEAL_MAX);
        this.playerHealth = Math.min(
          GAME_CONFIG.MAX_HEALTH,
          this.playerHealth + healValue
        );
        this.addLogMessage("player", "heal", healValue);
      });
    },
    surrender() {
      this.winner = "monster";
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
