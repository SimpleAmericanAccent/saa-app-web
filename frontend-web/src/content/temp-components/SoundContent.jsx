import { Link } from "react-router-dom";
import PlayableWord from "@/content/temp-components/PlayableWord";

export function SoundContent({
  data,
  type,
  soundKey,
  moduleId,
  showNavigation = true,
  children,
}) {
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
