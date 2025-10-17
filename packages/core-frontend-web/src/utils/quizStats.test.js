import { getCategoryStats, getCategoryCompletion } from "./quizStats.js";

describe("Quiz Statistics", () => {
  const mockResults = {
    kit_fleece: {
      percentage: 80,
      recentPercentage: 85,
      totalTrials: 100,
      recentTotalTrials: 20,
      correctTrials: 80,
      recentCorrectTrials: 17,
    },
    trap_dress: {
      percentage: 70,
      recentPercentage: 75,
      totalTrials: 50,
      recentTotalTrials: 10,
      correctTrials: 35,
      recentCorrectTrials: 7,
    },
    dh_d: {
      percentage: 90,
      recentPercentage: 95,
      totalTrials: 30,
      recentTotalTrials: 15,
      correctTrials: 27,
      recentCorrectTrials: 14,
    },
  };

  describe("getCategoryStats", () => {
    it("should calculate vowel category stats correctly", async () => {
      const result = await getCategoryStats("vowels", mockResults);

      expect(result.average).toBe(80); // (85 + 75) / 2 = 80
      expect(result.totalTrials).toBe(30); // 20 + 10
      expect(result.correctTrials).toBe(24); // 17 + 7
    });

    it("should calculate consonant category stats correctly", async () => {
      const result = await getCategoryStats("consonants", mockResults);

      expect(result.average).toBe(95); // Only dh_d has recent data
      expect(result.totalTrials).toBe(15); // Only dh_d recent trials
      expect(result.correctTrials).toBe(14); // Only dh_d recent correct
    });

    it("should return null average and zero trials when no results exist", async () => {
      const result = await getCategoryStats("vowels", {});

      expect(result.average).toBeNull();
      expect(result.totalTrials).toBe(0);
      expect(result.correctTrials).toBe(0);
    });

    it("should fall back to all-time data when recent data is not available", async () => {
      const resultsWithoutRecent = {
        kit_fleece: {
          percentage: 80,
          totalTrials: 100,
          correctTrials: 80,
        },
      };

      const result = await getCategoryStats("vowels", resultsWithoutRecent);

      expect(result.average).toBe(80);
      expect(result.totalTrials).toBe(100);
      expect(result.correctTrials).toBe(80);
    });
  });

  describe("getCategoryCompletion", () => {
    it("should calculate vowel completion correctly", async () => {
      const result = await getCategoryCompletion("vowels", mockResults);

      expect(result.completed).toBe(2); // kit_fleece and trap_dress
      expect(result.total).toBe(5); // Total vowel quizzes
      expect(result.percentage).toBe(40); // 2/5 * 100 = 40
    });

    it("should calculate consonant completion correctly", async () => {
      const result = await getCategoryCompletion("consonants", mockResults);

      expect(result.completed).toBe(1); // Only dh_d
      expect(result.total).toBe(11); // Total consonant quizzes
      expect(result.percentage).toBe(9); // 1/11 * 100 = 9 (rounded)
    });

    it("should return zero completion when no results exist", async () => {
      const result = await getCategoryCompletion("vowels", {});

      expect(result.completed).toBe(0);
      expect(result.total).toBe(5);
      expect(result.percentage).toBe(0);
    });

    it("should return 100% completion when all quizzes are completed", async () => {
      // Create mock results for all vowel quizzes
      const allVowelResults = {
        kit_fleece: { percentage: 80 },
        trap_dress: { percentage: 70 },
        ban_dress: { percentage: 90 },
        foot_goose: { percentage: 85 },
        strut_lot: { percentage: 75 },
      };

      const result = await getCategoryCompletion("vowels", allVowelResults);

      expect(result.completed).toBe(5);
      expect(result.total).toBe(5);
      expect(result.percentage).toBe(100);
    });
  });
});
