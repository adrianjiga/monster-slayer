function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const app = Vue.createApp({
  data() {
    return {
      playerHealth: 100,
      monsterHealth: 100,
    };
  },
  computed: {
    monsterBarStyles() {
      return { width: this.monsterHealth + "%" };
    },
    playerBarStyles() {
      return { width: this.playerHealth + "%" };
    },
  },
  methods: {
    attackMonster() {
      const attackDamage = getRandomValue(5, 12);
      this.monsterHealth -= attackDamage;
      this.attackPlayer();
    },
    attackPlayer() {
      const attackDamage = getRandomValue(8, 13);
      this.playerHealth -= attackDamage;
    },
  },
});

app.mount("#game");
