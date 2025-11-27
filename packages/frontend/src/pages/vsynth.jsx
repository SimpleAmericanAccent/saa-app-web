import VowelSynthesizer from "../components/vowel-synth";

export default function VSynth() {
  return (
    <>
      <section>
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-1 md:mb-4">
          Vowel Synthesizer
        </h2>
        <VowelSynthesizer />
      </section>
    </>
  );
}
