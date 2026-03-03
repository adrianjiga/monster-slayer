import { describe, it, expect, vi, afterEach } from "vitest";
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
} from "../game-logic.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe("GAME_CONFIG", () => {
  it("defines all required keys", () => {
    const requiredKeys = [
      "PLAYER_ATTACK_MIN",
      "PLAYER_ATTACK_MAX",
      "MONSTER_ATTACK_MIN",
      "MONSTER_ATTACK_MAX",
      "SPECIAL_ATTACK_MIN",
      "SPECIAL_ATTACK_MAX",
      "HEAL_MIN",
      "HEAL_MAX",
      "MAX_HEALTH",
      "SPECIAL_ATTACK_INTERVAL",
    ];
    requiredKeys.forEach((key) => expect(GAME_CONFIG).toHaveProperty(key));
  });

  it("has MIN strictly less than MAX for every range", () => {
    expect(GAME_CONFIG.PLAYER_ATTACK_MIN).toBeLessThan(GAME_CONFIG.PLAYER_ATTACK_MAX);
    expect(GAME_CONFIG.MONSTER_ATTACK_MIN).toBeLessThan(GAME_CONFIG.MONSTER_ATTACK_MAX);
    expect(GAME_CONFIG.SPECIAL_ATTACK_MIN).toBeLessThan(GAME_CONFIG.SPECIAL_ATTACK_MAX);
    expect(GAME_CONFIG.HEAL_MIN).toBeLessThan(GAME_CONFIG.HEAL_MAX);
  });

  it("has positive values for all settings", () => {
    Object.values(GAME_CONFIG).forEach((value) =>
      expect(value).toBeGreaterThan(0)
    );
  });

  it("special attack deals more maximum damage than a normal attack", () => {
    expect(GAME_CONFIG.SPECIAL_ATTACK_MAX).toBeGreaterThan(GAME_CONFIG.PLAYER_ATTACK_MAX);
  });
});

describe("GAME_ACTORS", () => {
  it("defines PLAYER and MONSTER string values", () => {
    expect(GAME_ACTORS.PLAYER).toBe("player");
    expect(GAME_ACTORS.MONSTER).toBe("monster");
  });
});

describe("ACTION_TYPES", () => {
  it("defines ATTACK and HEAL string values", () => {
    expect(ACTION_TYPES.ATTACK).toBe("attack");
    expect(ACTION_TYPES.HEAL).toBe("heal");
  });
});

describe("GAME_OUTCOMES", () => {
  it("defines all three outcome values", () => {
    expect(GAME_OUTCOMES.PLAYER).toBe("player");
    expect(GAME_OUTCOMES.MONSTER).toBe("monster");
    expect(GAME_OUTCOMES.DRAW).toBe("draw");
  });
});

// ---------------------------------------------------------------------------
// getRandomValue
// ---------------------------------------------------------------------------

describe("getRandomValue(min, max)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an integer", () => {
    for (let i = 0; i < 50; i++) {
      expect(Number.isInteger(getRandomValue(5, 12))).toBe(true);
    }
  });

  it("returns a value within [min, max)", () => {
    for (let i = 0; i < 100; i++) {
      const result = getRandomValue(5, 12);
      expect(result).toBeGreaterThanOrEqual(5);
      expect(result).toBeLessThan(12);
    }
  });

  it("always returns min when the range spans exactly one integer", () => {
    for (let i = 0; i < 20; i++) {
      expect(getRandomValue(7, 8)).toBe(7);
    }
  });

  it("covers the full integer range over many trials", () => {
    const results = new Set();
    for (let i = 0; i < 2000; i++) {
      results.add(getRandomValue(1, 10));
    }
    // Range [1, 10) contains exactly 9 distinct integers
    expect(results.size).toBe(9);
  });

  it("returns min when Math.random() returns 0", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(getRandomValue(5, 12)).toBe(5);
  });

  it("returns max - 1 when Math.random() is just below 1", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9999);
    // floor(0.9999 * (12 - 5)) + 5 = floor(6.9993) + 5 = 6 + 5 = 11
    expect(getRandomValue(5, 12)).toBe(11);
  });
});

// ---------------------------------------------------------------------------
// healthBarStyle
// ---------------------------------------------------------------------------

describe("healthBarStyle(health)", () => {
  it("returns the correct width for full health", () => {
    expect(healthBarStyle(100)).toEqual({ width: "100%" });
  });

  it("returns the correct width for partial health", () => {
    expect(healthBarStyle(75)).toEqual({ width: "75%" });
    expect(healthBarStyle(50)).toEqual({ width: "50%" });
    expect(healthBarStyle(1)).toEqual({ width: "1%" });
  });

  it('returns "0%" for exactly zero health', () => {
    expect(healthBarStyle(0)).toEqual({ width: "0%" });
  });

  it("clamps negative health to zero width", () => {
    expect(healthBarStyle(-1)).toEqual({ width: "0%" });
    expect(healthBarStyle(-50)).toEqual({ width: "0%" });
    expect(healthBarStyle(-999)).toEqual({ width: "0%" });
  });
});

// ---------------------------------------------------------------------------
// getActorLabel
// ---------------------------------------------------------------------------

describe("getActorLabel(actor)", () => {
  it('returns "Player" for the player actor constant', () => {
    expect(getActorLabel(GAME_ACTORS.PLAYER)).toBe("Player");
  });

  it('returns "Monster" for the monster actor constant', () => {
    expect(getActorLabel(GAME_ACTORS.MONSTER)).toBe("Monster");
  });

  it('returns "Monster" for any unknown actor value (safe fallback)', () => {
    expect(getActorLabel("unknown")).toBe("Monster");
    expect(getActorLabel(undefined)).toBe("Monster");
    expect(getActorLabel(null)).toBe("Monster");
  });
});

// ---------------------------------------------------------------------------
// shouldDisableSpecialAttack
// ---------------------------------------------------------------------------

describe("shouldDisableSpecialAttack(currentRound)", () => {
  it("is not disabled at round 0 (start of game)", () => {
    expect(shouldDisableSpecialAttack(0)).toBe(false);
  });

  it("is disabled on rounds that are not multiples of SPECIAL_ATTACK_INTERVAL", () => {
    expect(shouldDisableSpecialAttack(1)).toBe(true);
    expect(shouldDisableSpecialAttack(2)).toBe(true);
    expect(shouldDisableSpecialAttack(4)).toBe(true);
    expect(shouldDisableSpecialAttack(5)).toBe(true);
  });

  it("is enabled on exact multiples of SPECIAL_ATTACK_INTERVAL", () => {
    expect(shouldDisableSpecialAttack(3)).toBe(false);
    expect(shouldDisableSpecialAttack(6)).toBe(false);
    expect(shouldDisableSpecialAttack(9)).toBe(false);
  });

  it("respects the SPECIAL_ATTACK_INTERVAL constant", () => {
    const interval = GAME_CONFIG.SPECIAL_ATTACK_INTERVAL;
    expect(shouldDisableSpecialAttack(interval)).toBe(false);
    expect(shouldDisableSpecialAttack(interval * 2)).toBe(false);
    expect(shouldDisableSpecialAttack(interval * 3)).toBe(false);
    expect(shouldDisableSpecialAttack(interval - 1)).toBe(true);
    expect(shouldDisableSpecialAttack(interval + 1)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// determineWinner
// ---------------------------------------------------------------------------

describe("determineWinner(playerHealth, monsterHealth)", () => {
  it("returns null when both players have health remaining", () => {
    expect(determineWinner(100, 100)).toBeNull();
    expect(determineWinner(1, 1)).toBeNull();
    expect(determineWinner(50, 30)).toBeNull();
  });

  it("returns GAME_OUTCOMES.MONSTER when player health reaches 0", () => {
    expect(determineWinner(0, 50)).toBe(GAME_OUTCOMES.MONSTER);
  });

  it("returns GAME_OUTCOMES.MONSTER when player health goes negative", () => {
    expect(determineWinner(-5, 50)).toBe(GAME_OUTCOMES.MONSTER);
  });

  it("returns GAME_OUTCOMES.PLAYER when monster health reaches 0", () => {
    expect(determineWinner(50, 0)).toBe(GAME_OUTCOMES.PLAYER);
  });

  it("returns GAME_OUTCOMES.PLAYER when monster health goes negative", () => {
    expect(determineWinner(50, -10)).toBe(GAME_OUTCOMES.PLAYER);
  });

  it("returns GAME_OUTCOMES.DRAW when both health values reach 0", () => {
    expect(determineWinner(0, 0)).toBe(GAME_OUTCOMES.DRAW);
  });

  it("returns GAME_OUTCOMES.DRAW when both health values are negative", () => {
    expect(determineWinner(-3, -7)).toBe(GAME_OUTCOMES.DRAW);
  });

  it("prioritises DRAW over individual wins when both are at or below 0", () => {
    const result = determineWinner(0, 0);
    expect(result).toBe(GAME_OUTCOMES.DRAW);
    expect(result).not.toBe(GAME_OUTCOMES.PLAYER);
    expect(result).not.toBe(GAME_OUTCOMES.MONSTER);
  });

  it("returns null when player has exactly 1 health left", () => {
    expect(determineWinner(1, 100)).toBeNull();
  });
});
