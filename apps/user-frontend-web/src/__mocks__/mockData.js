export const mockTranscript = {
  speech: {
    paragraphs: [
      {
        words: [
          {
            ortho: "hello",
            pos: "interjection",
            phonemes: [
              {
                expected: "h",
                startChar: 0,
                endChar: 1,
                startTime: null,
                endTime: null,
              },
              {
                expected: "DRESS",
                startChar: 1,
                endChar: 2,
                startTime: null,
                endTime: null,
              },
              {
                expected: "l",
                startChar: 2,
                endChar: 4,
                startTime: null,
                endTime: null,
              },
              {
                expected: "GOAT",
                startChar: 4,
                endChar: 5,
                startTime: null,
                endTime: null,
              },
            ],
            phones: [{}, {}],
          },
          {
            word: "world",
            phonemes: ["w", "NURSE", "l", "d"],
          },
        ],
      },
      {},
    ],
  },
};

export const mockPhonemeDefinitions = {
  h: {
    type: "consonant",
    ipa: "h",
    realizations: {},
  },
  FLEECE: {
    type: "vowel",
    ipa: "i",
    realizations: {},
  },
};

export const mockPhoneDefinitions = {};

export const mockPOSDictionary = {};

export const mockDictionary = {
  hello: {
    morphology: {
      category: "interjection",
    },
    options: [
      [
        {
          expected: "h",
          startChar: 0,
          endChar: 1,
          startTime: null,
          endTime: null,
        },
        {
          expected: "DRESS",
          startChar: 1,
          endChar: 2,
          startTime: null,
          endTime: null,
        },
        {
          expected: "l",
          startChar: 2,
          endChar: 4,
          startTime: null,
          endTime: null,
        },
        {
          expected: "GOAT",
          startChar: 4,
          endChar: 5,
          startTime: null,
          endTime: null,
        },
      ],
    ],
  },
};
