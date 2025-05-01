import { Link } from "react-router-dom";
import PlayableWord from "@/content/temp-components/PlayableWord";
import { useState, useEffect } from "react";

export function SoundContent({
  data,
  type,
  soundKey,
  moduleId,
  showNavigation = true,
  children,
}) {
  const [frequentWords, setFrequentWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredWord, setHoveredWord] = useState(null);

  useEffect(() => {
    const fetchFrequentWords = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/ortho/lex/${soundKey}?limit=20&stress=1`
        );
        if (response.ok) {
          const data = await response.json();
          setFrequentWords(data);
        }
      } catch (error) {
        console.error("Error fetching frequent words:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (soundKey) {
      fetchFrequentWords();
    }
  }, [soundKey]);

  if (!data) return children;

  const { representations, spellings } = data;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        {soundKey} {type === "vowel" ? "Vowel" : "Consonant"} Sound
        <span className="text-xl text-gray-500 ml-3">
          {representations.phonemic}
        </span>
      </h1>

      {showNavigation && (
        <div className="mb-8">
          <Link
            to={`/learn/${moduleId}`}
            className="text-blue-500 hover:underline"
          >
            ← Back to {type === "vowel" ? "Vowels" : "Consonants"}
          </Link>
        </div>
      )}

      {/* New section for frequent words with hover effect */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Most Frequent Words</h2>
        {isLoading ? (
          <div className="text-gray-500">Loading frequent words...</div>
        ) : frequentWords.length > 0 ? (
          <div className="flex flex-wrap">
            {frequentWords.map((word) => (
              <div
                key={word.word}
                className="relative"
                onMouseEnter={() => setHoveredWord(word.word)}
                onMouseLeave={() => setHoveredWord(null)}
              >
                <div className="bg-gray-800 rounded flex items-center h-8 m-0.5">
                  <PlayableWord word={word.word} className="text-sm px-2" />
                </div>
                {hoveredWord === word.word && (
                  <div className="absolute z-10 bg-black text-white px-2 py-1 rounded text-xs top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none">
                    {word.pronsCmuDict.map((pron, idx) => (
                      <div key={idx} className="font-mono">
                        {pron.pronCmuDict}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No frequent words found.</div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Examples</h2>
        <div className="flex flex-wrap gap-4">
          {spellings[0].examples.slice(0, 3).map((word) => (
            <PlayableWord
              key={word}
              word={word}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            />
          ))}
        </div>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Representations</h2>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center border rounded bg-[#111] px-3 py-1.5">
            <h3 className="text-sm text-gray-400 mr-2">Phonemic</h3>
            <p className="font-mono">{representations.phonemic}</p>
          </div>
          <div className="inline-flex items-center border rounded bg-[#111] px-3 py-1.5">
            <h3 className="text-sm text-gray-400 mr-2">Phonetic</h3>
            <p className="font-mono">
              {Array.isArray(representations.phonetic)
                ? representations.phonetic.join(", ")
                : typeof representations.phonetic === "object"
                ? Object.entries(representations.phonetic)
                    .map(
                      ([position, allophones]) =>
                        `${position}: ${
                          Array.isArray(allophones)
                            ? allophones.join(", ")
                            : allophones
                        }`
                    )
                    .join("; ")
                : representations.phonetic}
            </p>
          </div>
          {representations.respelling && (
            <div className="inline-flex items-center border rounded bg-[#111] px-3 py-1.5">
              <h3 className="text-sm text-gray-400 mr-2">Respelling</h3>
              <p className="font-mono">
                {Array.isArray(representations.respelling)
                  ? representations.respelling.join(", ")
                  : representations.respelling}
              </p>
            </div>
          )}
          {representations.gambiarra && (
            <div className="inline-flex items-center border rounded bg-[#111] px-3 py-1.5">
              <h3 className="text-sm text-gray-400 mr-2">Gambiarra</h3>
              <p className="font-mono">{representations.gambiarra}</p>
            </div>
          )}
        </div>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Spelling Patterns</h2>
        <div className="space-y-3">
          {spellings.map((spelling, index) => (
            <div
              key={index}
              className="bg-[#111] rounded border border-gray-800 px-4 py-2"
            >
              <h3 className="text-sm text-gray-400 mb-1.5">
                Pattern: {spelling.pattern}
              </h3>
              <div className="flex flex-wrap gap-2">
                {spelling.examples.map((example, i) => (
                  <PlayableWord
                    key={i}
                    word={example}
                    isInline={true}
                    className="inline-flex items-center gap-1 text-sm"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {children}
    </div>
  );
}

export function SoundGrid({ sounds, moduleId, type }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(sounds).map(([key, data]) => {
        const examples = data.spellings
          .flatMap((s) => s.examples.slice(0, 1))
          .slice(0, 3);

        return (
          <Link
            key={key}
            to={`/learn/${moduleId}/${encodeURIComponent(key)}`}
            className="block p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">
              {key}
              <span className="text-sm text-gray-500 ml-2">
                {data.representations.phonemic}
              </span>
            </h2>
            <div
              className="flex flex-wrap gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {examples.map((example, i) => (
                <PlayableWord
                  key={i}
                  word={example}
                  isInline={true}
                  className="text-gray-600"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
              ))}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
