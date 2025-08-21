// Quiz statistics utility functions
// These can be used from anywhere in the app to get quiz completion and performance data

// Quiz type IDs - defined here to avoid circular imports
const QUIZ_TYPE_IDS = {
  KIT_FLEECE: "kit_fleece",
  TRAP_DRESS: "trap_dress",
  BAN_DRESS: "ban_dress",
  FOOT_GOOSE: "foot_goose",
  STRUT_LOT: "strut_lot",
  DH_D: "dh_d",
  TH_T: "th_t",
  TH_F: "th_f",
  R_NULL: "r_null",
  T_CH: "t_ch",
  DARK_L_O: "dark_l_o",
  DARK_L_U: "dark_l_u",
  S_Z: "s_z",
  M_N: "m_n",
  N_NG: "n_ng",
  M_NG: "m_ng",
};

// Get quiz results from localStorage
export const getQuizResults = () => {
  try {
    const results = localStorage.getItem("quizResults");
    return results ? JSON.parse(results) : {};
  } catch (error) {
    console.error("Error parsing quiz results:", error);
    return {};
  }
};

// Calculate average performance for a category
export const getCategoryAverage = (category, previousResults) => {
  const categoryQuizIds =
    category === "vowels"
      ? [
          QUIZ_TYPE_IDS.KIT_FLEECE,
          QUIZ_TYPE_IDS.TRAP_DRESS,
          QUIZ_TYPE_IDS.BAN_DRESS,
          QUIZ_TYPE_IDS.FOOT_GOOSE,
          QUIZ_TYPE_IDS.STRUT_LOT,
        ]
      : [
          QUIZ_TYPE_IDS.DH_D,
          QUIZ_TYPE_IDS.TH_T,
          QUIZ_TYPE_IDS.TH_F,
          QUIZ_TYPE_IDS.R_NULL,
          QUIZ_TYPE_IDS.T_CH,
          QUIZ_TYPE_IDS.DARK_L_O,
          QUIZ_TYPE_IDS.DARK_L_U,
          QUIZ_TYPE_IDS.S_Z,
          QUIZ_TYPE_IDS.M_N,
          QUIZ_TYPE_IDS.N_NG,
          QUIZ_TYPE_IDS.M_NG,
        ];

  const results = categoryQuizIds
    .map((id) => previousResults[id])
    .filter((result) => result !== undefined);

  if (results.length === 0) return null;

  const average =
    results.reduce((sum, result) => sum + result.percentage, 0) /
    results.length;
  return Math.round(average);
};

// Calculate completion percentage for a category
export const getCategoryCompletion = (category, previousResults) => {
  const categoryQuizIds =
    category === "vowels"
      ? [
          QUIZ_TYPE_IDS.KIT_FLEECE,
          QUIZ_TYPE_IDS.TRAP_DRESS,
          QUIZ_TYPE_IDS.BAN_DRESS,
          QUIZ_TYPE_IDS.FOOT_GOOSE,
          QUIZ_TYPE_IDS.STRUT_LOT,
        ]
      : [
          QUIZ_TYPE_IDS.DH_D,
          QUIZ_TYPE_IDS.TH_T,
          QUIZ_TYPE_IDS.TH_F,
          QUIZ_TYPE_IDS.R_NULL,
          QUIZ_TYPE_IDS.T_CH,
          QUIZ_TYPE_IDS.DARK_L_O,
          QUIZ_TYPE_IDS.DARK_L_U,
          QUIZ_TYPE_IDS.S_Z,
          QUIZ_TYPE_IDS.M_N,
          QUIZ_TYPE_IDS.N_NG,
          QUIZ_TYPE_IDS.M_NG,
        ];

  const completedQuizzes = categoryQuizIds.filter(
    (id) => previousResults[id] !== undefined
  );
  const completionPercentage = Math.round(
    (completedQuizzes.length / categoryQuizIds.length) * 100
  );

  return {
    completed: completedQuizzes.length,
    total: categoryQuizIds.length,
    percentage: completionPercentage,
  };
};

// Get overall quiz statistics
export const getQuizStats = () => {
  const previousResults = getQuizResults();

  const vowelsCompletion = getCategoryCompletion("vowels", previousResults);
  const consonantsCompletion = getCategoryCompletion(
    "consonants",
    previousResults
  );
  const vowelsAverage = getCategoryAverage("vowels", previousResults);
  const consonantsAverage = getCategoryAverage("consonants", previousResults);

  // Calculate overall stats
  const totalCompleted =
    vowelsCompletion.completed + consonantsCompletion.completed;
  const totalQuizzes = vowelsCompletion.total + consonantsCompletion.total;
  const overallCompletion = Math.round((totalCompleted / totalQuizzes) * 100);

  // Calculate overall average (only for completed quizzes)
  const allResults = Object.values(previousResults);
  const overallAverage =
    allResults.length > 0
      ? Math.round(
          allResults.reduce((sum, result) => sum + result.percentage, 0) /
            allResults.length
        )
      : null;

  return {
    vowels: {
      completion: vowelsCompletion,
      average: vowelsAverage,
    },
    consonants: {
      completion: consonantsCompletion,
      average: consonantsAverage,
    },
    overall: {
      completed: totalCompleted,
      total: totalQuizzes,
      completion: overallCompletion,
      average: overallAverage,
    },
  };
};
