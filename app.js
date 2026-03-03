import {
  GAME_CONFIG,
  GAME_ACTORS,
  ACTION_TYPES,
  GAME_OUTCOMES,
  getRandomValue,
  healthBarStyle,
  getActorLabel,
  shouldDisableSpecialAttack,
  determineWinner,
} from "./game-logic.js";

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
      return healthBarStyle(this.monsterHealth);
    },
    playerBarStyles() {
      return healthBarStyle(this.playerHealth);
    },
    isSpecialAttackDisabled() {
      return shouldDisableSpecialAttack(this.currentRound);
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
    checkWinner() {
      const result = determineWinner(this.playerHealth, this.monsterHealth);
      if (result) this.winner = result;
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
        this.playerHealth = Math.min(GAME_CONFIG.MAX_HEALTH, this.playerHealth + healValue);
        this.addLogMessage(GAME_ACTORS.PLAYER, ACTION_TYPES.HEAL, healValue);
      });
    },
    surrender() {
      this.winner = GAME_OUTCOMES.MONSTER;
    },
    getActorLabel(actor) {
      return getActorLabel(actor);
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
