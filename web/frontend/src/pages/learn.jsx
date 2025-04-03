export default function Learn() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">SAA Resources</h1>
      <p>
        So far we have 3 core topics for which we have a Zoom call recording
        available:
      </p>

      <ul className="px-8 list-disc">
        <li>
          <a
            href="https://youtu.be/9mWuumukRXY"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vowels
          </a>
        </li>
        <li>
          <a
            href="https://youtu.be/lWbWnhOhVj0"
            target="_blank"
            rel="noopener noreferrer"
          >
            Consonants
          </a>
        </li>
        <li>
          <a
            href="https://youtu.be/CUBYOPIDDCs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Stress, Rhythm, & Connected Speech
          </a>
        </li>
      </ul>

      <h1 className="text-2xl font-bold mt-10">External Resources</h1>

      <p className="mt-4">Pracice phrases & words</p>
      <ul className="px-8 list-disc">
        <li>
          <a
            href="https://ecampusontario.pressbooks.pub/lexicalsets/chapter/1-kit-lexical-set/#phrases"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lexical Sets for Actors
          </a>{" "}
          - Practice phrases & words for <i>vowels</i>.
        </li>
        <li>
          <a
            href="https://www.home-speech-home.com/speech-therapy-word-lists.html#:~:text=Client%20Centered%20Products-,Articulation,-Each%20list%20of"
            target="_blank"
            rel="noopener noreferrer"
          >
            Home Speech Home
          </a>{" "}
          - Practice phrases & words for <i>consonants</i>.
        </li>
        <li>
          <a
            href="https://chatgpt.com/?q=Can%20you%20please%20generate%205%20to%2010%20practice%20phrases%20for%20me%20to%20help%20me%20train%20my%20American%20accent%3F%20I%27ll%20supply%20you%20some%20words%20that%20I%20want%20you%20to%20make%20sure%20to%20include%20in%20the%20phrases."
            target="_blank"
            rel="noopener noreferrer"
          >
            ChatGPT
          </a>{" "}
          - Use ChatGPT to generate your own practice phrases. I've included a
          sample prompt for you to get started - click to try it out
          automatically. Try following up with "the this that these those"
        </li>
      </ul>
    </div>
  );
}
