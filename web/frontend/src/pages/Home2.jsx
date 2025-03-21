import { useEffect, useState } from "react";

export default function Home2() {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    // Get all h1 and h2 elements after component mounts
    const contentDiv = document.querySelector(".wls-content");
    const elements = contentDiv.querySelectorAll("h1, h2");
    const structure = [];
    let currentH1 = null;

    elements.forEach((heading) => {
      // Helper function to create consistent IDs
      const createId = (text) => {
        return text
          .replace(/[()]/g, "") // Remove parentheses
          .replace(/\s+/g, "_"); // Replace spaces with underscores
      };
      if (heading.tagName === "H1") {
        currentH1 = {
          text: heading.textContent,
          id: createId(heading.textContent),
          h2s: [],
        };
        structure.push(currentH1);
      } else if (heading.tagName === "H2" && currentH1) {
        currentH1.h2s.push({
          text: heading.textContent,
          id: createId(heading.textContent),
        });
      }
    });

    setHeadings(structure);
  }, []);

  const handleNavClick = (id) => {
    const contentDiv = document.querySelector(".wls-content");
    const element = contentDiv.querySelector(`#${id}`);
    if (element) {
      contentDiv.scrollTo({
        top: element.offsetTop - 40,
        behavior: "smooth",
      });
    }
  };
  return (
    <div className="bg-background">
      <div className="flex fixed">
        {/* Side Navigation */}
        <div className="w-[180px] h-screen top-0 overflow-y-auto border-r bg-card p-4">
          <ul className="space-y-1">
            {headings.map((h1) => (
              <li key={h1.id}>
                <a
                  href={`#${h1.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(h1.id);
                  }}
                >
                  {h1.text}
                </a>
                <ul className="ml-4 space-y-1">
                  {h1.h2s.map((h2) => (
                    <li key={h2.id}>
                      <a
                        href={`#${h2.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavClick(h2.id);
                        }}
                      >
                        {h2.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="wls-content h-screen flex-1 px-5 overflow-y-auto scroll-py-0">
          <h1 id="Vowels">Vowels</h1>
          <h2 id="FLEECE">FLEECE</h2>
          Spellings & Example Words:
          <ul>
            <li>
              e: he, she, me, we, be, the, these, concede, meme, theme, scheme,
              extreme, gene, scene, obese, compete, eve
            </li>
            <li>ee: bee, fee, free, knee, tee, see</li>
            <li>ea: sea, each, wheat, tear, eat, meat</li>
            <li>
              i: ski, visa, pizza, bistro, police, prestige, automobile, regime,
              machine, routine, cuisine, vaccine, unique
            </li>
            <li>
              ei: seize, ceiling, either, neither, receive, leisure, protein,
              receipt, perceive, caffeine
            </li>
            <li>
              ie: lien, chief, field, piece, brief, yield, grief, thief, niece,
              series, belief, married, studied
            </li>
            <li>oe: Phoebe, amoeba, phoenix, subpoena</li>
            <li>ae: aeon, aegis, Caesar, archeaology</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: ee</li>
            <li>Phonemic: /i/</li>
            <li>Phonetic: [i]</li>
          </ul>
          <h2 id="happY">happY</h2>
          Spellings & Example Words:
          <ul>
            <li>y: happy, lucky, silly</li>
            <li>
              ey: monkey, turkey, hockey, donkey, valley, journey, money, honey,
              alley
            </li>
            <li>ie: cookie, movie, rookie, Barbie, brownie, beanie</li>
            <li>
              i: taxi, kiwi, deli, chili, corgi, sushi, khaki, safari, tsunami,
              martini, graffiti
            </li>
            <li>
              ee: coffee, toffee, bungee, employee, pedigree, attendee,
              committee
            </li>
            <li>ea: guinea, Chelsea</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: ee</li>
            <li>Phonemic: /i/</li>
            <li>Phonetic: [i]</li>
          </ul>
          <h2 id="KIT">KIT</h2>
          Spellings & Example Words:
          <ul>
            <li>i: it, this, did, if, his, pick, little, big, different</li>
            <li>e: pretty, women, actress</li>
            <li>o: women</li>
            <li>u: busy, business</li>
            <li>
              y: myth, symbol, system, typical, mystery, crystal, rhythm,
              syllable
            </li>
            <li>ui: built, build, guilt, guitar, circuit</li>
            <li>a: garbage</li>
            <li>ai: bargain</li>
            <li>ei: foreign</li>
            <li>oi: connoisseur</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: i, ih</li>
            <li>Phonemic: /ɪ/</li>
            <li>Phonetic: [ɪ]</li>
          </ul>
          <h2 id="DRESS">DRESS</h2>
          Spellings & Example Words:
          <ul>
            <li>e: bed, red, fed, led, deck, end, ten, spell, left</li>
            <li>ea: bread, head, dead, lead, read, spread, thread, instead</li>
            <li>a: any, many, Thames</li>
            <li>ie: friend</li>
            <li>ay: says</li>
            <li>ai: said</li>
            <li>ei: heifer</li>
            <li>eo: leopard</li>
            <li>ue: guess, guest</li>
            <li>exceptions: bury</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: e, eh</li>
            <li>Phonemic: /ɛ/</li>
            <li>Phonetic: [ɛ]</li>
          </ul>
          <h2 id="TRAP">TRAP</h2>
          Spellings & Example Words:
          <ul>
            <li>a: ad, bad, sad, mad, hat, cat, Dad, sack, rack</li>
            <li>ai: plaid</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: a</li>
            <li>Phonemic: /æ/</li>
            <li>Phonetic: [æ]</li>
          </ul>
          <h2 id="TRAM">TRAM</h2>
          Spellings & Example Words:
          <ul>
            <li>am: am, dam, family, ham, jam, lamb, Ma&apos;am, ram, Sam,</li>
            <li>
              an: an, ban, band, can, can&apos;t, fan, grandma, hand, man, pan,
              ran, sand, analyze
            </li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: a</li>
            <li>Phonemic: /æ/</li>
            <li>Phonetic: [eə]</li>
          </ul>
          <h2 id="commA">commA</h2>
          Spellings & Example Words:
          <ul>
            <li>a: about, data</li>
            <li>u: upon, chorus</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: uh</li>
            <li>Phonemic: /ə/</li>
            <li>Phonetic: [ə]</li>
          </ul>
          <h2 id="GOOSE">GOOSE</h2>
          Spellings & Example Words:
          <ul>
            <li>o: do, who, to</li>
            <li>
              oo: too, boo, moo, zoo, room, food, soon, mood, moon, loop, noon
            </li>
            <li>ou: you, youth, soup, through</li>
            <li>
              u: tutor, tune, tube, truth, truly, include, produce, solution
            </li>
            <li>ue: blue, true, due, sue, glue, issue, Tuesday</li>
            <li>ew: new, threw, dew, flew, crew, chew, grew, knew</li>
            <li>wo: two</li>
            <li>eu: deuce, pseudo, sleuth, neuter, neutral, neutron</li>
            <li>ui: bruise, juice, suit</li>
            <li>ieu: lieu, lieutenant</li>
            <li>oe: shoe, canoe</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: oo</li>
            <li>Phonemic: /u/</li>
            <li>Phonetic: [u]</li>
          </ul>
          <h2 id="FOOT">FOOT</h2>
          Spellings & Example Words:
          <ul>
            <li>oo: wood, cook, foot, look, good, book, stood, cookies</li>
            <li>u: put, pudding, sugar, butcher, push, bush, cushion</li>
            <li>o: woman</li>
            <li>ou: could, should, would</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: u</li>
            <li>Phonemic: /ʊ/</li>
            <li>Phonetic: [ʊ]</li>
          </ul>
          <h2 id="STRUT">STRUT</h2>
          Spellings & Example Words:
          <ul>
            <li>u: fun, sun, run, cut, pun, putt, uncle, luck, shut, up</li>
            <li>
              o: done, come, honey, none, won, money, some, stomach, son, month,
              Monday, front, wonderful, among, monkey, nothing, other, mother,
              brother, another, love, above, cover, government
            </li>
            <li>
              ou: couple, double, trouble, Doug, touch, country, young,
              southern, tough, rough, enough, cousin
            </li>
            <li>oo: blood, flood</li>
            <li>oe: does</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: uh</li>
            <li>Phonemic: /ʌ/</li>
            <li>Phonetic: [ʌ̟]</li>
          </ul>
          <h2 id="LOT">LOT</h2>
          Spellings & Example Words:
          <ul>
            <li>o: lot, hot, dog, wrong, on</li>
            <li>
              a: wash, watch, bra, father, taco, pasta, Chicago, Obama, macho,
              nacho, massage, garage, Kanye
            </li>
            <li>ou: cough, thought, bought, fought</li>
            <li>
              au: caught, sausage, audio, audience, fraud, launch, laundry,
              sauce, taught, auto, daughter, glaucoma, trauma, haunted, author,
              cause, pause, applause, clause, nausea, menopause, caution
            </li>
            <li>
              aw: raw, saw, jaw, law, flaw, draw, lawn, straw, dawn, awesome,
              awful, hawk, paw
            </li>
            <li>e: entree, rendezvous</li>
            <li>ach: yacht</li>
            <li>ow: knowledge</li>
            <li>ea: Sean</li>
            <li>oa: broad</li>
            <li>as: Arkansas</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: aa, ah</li>
            <li>Phonemic: /ɑ/</li>
            <li>Phonetic: [ɑ]</li>
          </ul>
          <h2 id="FACE">FACE</h2>
          Spellings & Example Words:
          <ul>
            <li>a: cake, lake, fate, bacon, name, made</li>
            <li>ai: bait, wait, gait, gain, main</li>
            <li>ay: say, bay, day, may, way, hay, play, gray, pray, slay</li>
            <li>ei: vein, reindeer, beige, heinous</li>
            <li>ey: hey, they, whey, grey, prey, survey</li>
            <li>aig(h): straight, campaign</li>
            <li>eig(h): weigh, reign, eight, freight, neighbor, sleigh</li>
            <li>ea: break, steak, great, Reagan</li>
            <li>e: café, anime, Beyoncé</li>
            <li>ee: entree, fiancee, matinee</li>
            <li>et: ballet, buffet,</li>
            <li>ae: reggae, Gaelic</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: ay</li>
            <li>Phonemic: /eɪ/</li>
            <li>Phonetic: [e̞ɪ̯] (TBD)</li>
          </ul>
          <h2 id="PRICE">PRICE</h2>
          Spellings & Example Words:
          <ul>
            <li>i: I, hi, nice, rice, find, mind</li>
            <li>ie: pie, lie, die, tie</li>
            <li>y: by, bye, why, spy, my, cry, shy</li>
            <li>
              ig(h): high, sigh, night, frighten, sight, slight, right, sign
            </li>
            <li>eig(h): height, sleight</li>
            <li>
              ei: either, neither, Alzheimer&apos;s, Anaheim, Eiffel, Heineken
            </li>
            <li>uy: buy, guy</li>
            <li>oy: coyote</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: ai, iCe</li>
            <li>Phonemic: /aɪ/</li>
            <li>Phonetic: [ɑ̟ɪ̯] (TBD)</li>
          </ul>
          <h2 id="CHOICE">CHOICE</h2>
          Spellings & Example Words:
          <ul>
            <li>
              oi: oil, join, soil, coin, void, foil, boil, point, voice, joint,
              choice, toilet, invoice, hoist, moist, joist, rejoice
            </li>
            <li>
              oy: boy, toy, joy, soy, ploy, royal, enjoy, loyal, annoy,
              employee, destroy
            </li>
            <li>uoy: buoyancy</li>
            <li>awy: lawyer, sawyer</li>
            <li>eu: Freud, Reuters</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: oy</li>
            <li>Phonemic: /ɔɪ/</li>
            <li>Phonetic: [o̞ɪ̯] (TBD)</li>
          </ul>
          <h2 id="GOAT">GOAT</h2>
          Spellings & Example Words:
          <ul>
            <li>
              o: go, no, so, note, tote, wrote, vote, ago, pro, ego, only, also,
              most, both, home, open, those
            </li>
            <li>oh: oh, ohms</li>
            <li>oe: doe, foe, hoe, Joe, goes, toe, woe</li>
            <li>
              ow: own, low, owe, bow, know, slow, throw, row, sow, blow, glow,
              tow
            </li>
            <li>ew: sew</li>
            <li>oo: brooch</li>
            <li>
              oa: oak, oats, road, loan, load, coach, whoa, float, coat, boat,
              goat, moat, throat
            </li>
            <li>aoh: pharaoh</li>
            <li>eau: beau, bureau, plateau, chateau</li>
            <li>ough: though, although, dough, borough, thorough</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: ow</li>
            <li>
              Phonemic: /oʊ/ (I&apos;m not sure if I like this, but it&apos;s
              what&apos;s commonly written)
            </li>
            <li>Phonetic: [ʌʊ̯] (TBD)</li>
          </ul>
          <h2 id="MOUTH">MOUTH</h2>
          Spellings & Example Words:
          <ul>
            <li>
              ou: mouth, house, mouse, about, out, around, account, mountain,
              pound, south, found, sound
            </li>
            <li>
              ow: ow, how, bow, now, cow, brow, wow, vow, town, down, brown
            </li>
            <li>ough: bough</li>
            <li>ao: Tao</li>
            <li>au: tau, sauerkraut</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: au, ow</li>
            <li>Phonemic: /aʊ/</li>
            <li>Phonetic: [aʊ̯] (TBD)</li>
          </ul>
          <h1 id="Consonants">Consonants</h1>
          <p>(Work in progress...)</p>
          <h2 id="P">P</h2>
          Spellings & Example Words:
          <ul>
            <li>p: pie, spy, open, top</li>
            <li>pp: hippo, opposite</li>
            <li>pe: hope, tape</li>
            <li>ppe: steppe, shoppe</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: p</li>
            <li>Phonemic: /p/</li>
            <li>Phonetic / Allophones: [pʰ], [p], [p̚]</li>
          </ul>
          <h2 id="B">B</h2>
          Spellings & Example Words:
          <ul>
            <li>b: boy, obey, job</li>
            <li>bb: rabbit, hobby</li>
            <li>be: tube, globe</li>
            <li>bh: Bhutan</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: b</li>
            <li>Phonemic: /b/</li>
            <li>Phonetic: [b], [b̚]</li>
          </ul>
          <h2 id="T">T</h2>
          Spellings & Example Words:
          <ul>
            <li>t: to, stop, city, pot, try, trust, trick, atom</li>
            <li>
              tt: butt, pretty, letter, attack, little, better, attract,
              atrophy, Otto
            </li>
            <li>th: Thames, thyme, Thomas, Thai</li>
            <li>ed: liked, kicked</li>
            <li>bt: doubt, debt</li>
            <li>pt: receipt, pterodactyl</li>
            <li>te: bite, kite</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: t</li>
            <li>Phonemic: /t/</li>
            <li>
              Phonetic / Allophones:
              <ul>
                <li>Syllable-initial: [tʰ], [t]</li>
                <li>Intervocalic: [tʰ], [t], [ɾ]</li>
                <li>Syllable-final: [tʰ], [t], [ʔ], [tˀ], [t̚]</li>
                <li>T+R cluster: [tʰɹ̈], [tʰɹ̥̈], [t͡ʃɹ̈], [t͡ʃɹ̥̈]</li>
              </ul>
            </li>
          </ul>
          <h2 id="D">D</h2>
          Spellings & Example Words:
          <ul>
            <li>d: do, adore, bed</li>
            <li>dd: add, ladder, middle, odd, sudden</li>
            <li>ed: loved, played</li>
            <li>de: made, fade</li>
            <li>ld: could, would, should, solder</li>
            <li>dh: dharma, Gandhi</li>
            <li>ddh: Buddha</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: d</li>
            <li>Phonemic: /d/</li>
            <li>Phonetic: [d], [d̚], [ɾ]</li>
          </ul>
          <h2 id="K">K</h2>
          Spellings & Example Words:
          <ul>
            <li>k: key, sky, making, broken, ask, oak</li>
            <li>kk: trekking</li>
            <li>kh: Khan, ankh, khaki, sheikh</li>
            <li>ck: back, pick, rock</li>
            <li>c: can, act, Mac, epic, basic, music, logic</li>
            <li>cc: broccoli, account, occur</li>
            <li>
              ch: tech, echo, Bach, ache. mach, chaos, choir, chemical, chronic,
              stomach, scholar
            </li>
            <li>q: Qatar</li>
            <li>qu (becomes kw): quick, queen</li>
            <li>cqu (becomes kw): acquire, acquit</li>
            <li>que: antique, unique, baroque</li>
            <li>x (can become ks): excite, ex-girlfriend</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: k</li>
            <li>Phonemic: /k/</li>
            <li>Phonetic / Allophones: [kʰ], [k], [k̚]</li>
          </ul>
          <h2 id="G">G</h2>
          Spellings & Example Words:
          <ul>
            <li>g: go, ago, ag, bag</li>
            <li>gg: beggar, hugging</li>
            <li>gh: ghost, ghoul, ghetto, spaghetti</li>
            <li>gu: guest, guide, guitar, guilt, guess, guard</li>
            <li>
              gue: league, fatigue, intrigue, colleague, dialogue, catalogue,
              rogue, tongue, plague, vague
            </li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: ɡ</li>
            <li>Phonemic: /ɡ/</li>
            <li>Phonetic / Allophones: [ɡ], [ɡ̚]</li>
          </ul>
          <h2 id="CH">CH</h2>
          Spellings & Example Words:
          <ul>
            <li>ch: choose, rich, which, ostrich, sandwich</li>
            <li>tch: itch, scotch, pitch, witch</li>
            <li>t: try, trick, train, future, statue, mutual, mature</li>
            <li>c: cello, ciabatta, ciao</li>
            <li>cz: Czech</li>
            <li>ti (may become ch or sh): question, suggestion</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: ch</li>
            <li>Phonemic: /t͡ʃ/</li>
            <li>Phonetic: [t͡ʃ]</li>
          </ul>
          <h2 id="J">J</h2>
          Spellings & Example Words:
          <ul>
            <li>j: joy, major, enjoy, eject, ninja</li>
            <li>
              g: giraffe, gym, gentle, gender, gene, gel, gem, gin, germ, giant
            </li>
            <li>dj: adjust, adjective, adjacent, Djibouti</li>
            <li>ge: rage, mage, sage, huge, urge, range, large</li>
            <li>dge: edge, judge, lodge, badge, bridge</li>
            <li>d: soldier, individual</li>
            <li>
              d y (across word boundary, can be reduced): did you, would you
            </li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: j</li>
            <li>Phonemic: /d͡ʒ/</li>
            <li>Phonetic: [d͡ʒ]</li>
          </ul>
          <h2 id="M">M</h2>
          Spellings & Example Words:
          <ul>
            <li>m: man, moon, Jim</li>
            <li>mm: common, summer</li>
            <li>mb: comb, lamb, thumb</li>
            <li>mn: solemn</li>
            <li>lm: calm, palm</li>
            <li>hm: Hmong</li>
            <li>gm: phlegm, paradigm</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: m</li>
            <li>Phonemic: /m/</li>
            <li>Phonetic: [m]</li>
          </ul>
          <h2 id="N">N</h2>
          Spellings & Example Words:
          <ul>
            <li>n: no, on, never</li>
            <li>
              nt (sometimes can be reduced to just n): into, interview, internet
            </li>
            <li>kn: know, knock, knee, knight</li>
            <li>gn: gnat, foreign, gnome, sign</li>
            <li>pn: pneumonia, pneumatic</li>
            <li>mn: mnemonic</li>
            <li>nn: innovate</li>
            <li>nne: Anne, cayenne, julienne</li>
            <li>ne: phone</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: n</li>
            <li>Phonemic: /n/</li>
            <li>
              Phonetic: [n] but note it can float towards [ŋ] if followed by K
              or G
            </li>
          </ul>
          <h2 id="NG">NG</h2>
          Spellings & Example Words:
          <ul>
            <li>
              ng (may or may not include G sound): long, song, finger, singer,
              English, language, talking, length
            </li>
            <li>ngue: tongue, meringue, harangue</li>
            <li>nc (can become NG + K): uncle, function</li>
            <li>nk (can become NG + K): bank, sink, think</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: ng</li>
            <li>Phonemic: /ŋ/</li>
            <li>
              Phonetic / Allophones:
              <ul>
                <li>
                  [ŋ] - treat this as the default, as in &quot;singer&quot;
                </li>
                <li>
                  [ŋg] - in some cases there will be a noticeable G sound
                  afterwards, as in &quot;finger&quot;
                </li>
              </ul>
            </li>
          </ul>
          <h2 id="F">F</h2>
          Spellings & Example Words:
          <ul>
            <li>f: friend</li>
            <li>ph: phone, photo, graph, philosophy</li>
            <li>gh: tough, cough, laugh, enough</li>
            <li>ff: stuff, afford, coffee, different</li>
            <li>lf: calf, half</li>
            <li>pf: Pfizer, Pfeiffer</li>
            <li>ft: often, soften</li>
            <li>fe: wife, life, safe</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: f</li>
            <li>Phonemic: /f/</li>
            <li>Phonetic: [f]</li>
          </ul>
          <h2 id="V">V</h2>
          Spellings & Example Words:
          <ul>
            <li>v: very, avoid</li>
            <li>vv: savvy</li>
            <li>ve: save</li>
            <li>f: of</li>
            <li>ph: Stephen</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: v</li>
            <li>Phonemic: /v/</li>
            <li>Phonetic: [v]</li>
          </ul>
          <h2 id="TH_voiceless">TH (voiceless)</h2>
          Spellings & Example Words:
          <ul>
            <li>
              th: thin, think, with, three, breath, thing, theater, tooth,
              thick, author, Arthur, thermometer, thermostat
            </li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: th</li>
            <li>Phonemic: /θ/</li>
            <li>Phonetic: [θ]</li>
          </ul>
          <h2 id="TH_voiced">TH (voiced)</h2>
          Spellings & Example Words:
          <ul>
            <li>
              th: this, that, the, they, though, smooth, weather, mother,
              brother, father, other, another, rather, together, whether,
              wither, bother, either, neither
            </li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: th</li>
            <li>Phonemic: /ð/</li>
            <li>Phonetic: [ð]</li>
          </ul>
          <h2 id="S">S</h2>
          Spellings & Example Words:
          <ul>
            <li>s: sun, sit, slow, soft</li>
            <li>ss: pass, miss, boss, stress</li>
            <li>ce: nice, rice, twice, face</li>
            <li>se: house, mouse</li>
            <li>sc: scissors, scent, science, scene</li>
            <li>st: listen, castle, whistle</li>
            <li>ps: psychology, pseudonym</li>
            <li>ts: tsunami,</li>
            <li>c: city, ceiling, cycle, century</li>
            <li>ç or c: façade/facade</li>
            <li>zz (can become T+S): pizza</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: s</li>
            <li>Phonemic: /s/</li>
            <li>Phonetic: [s]</li>
          </ul>
          <h2 id="Z">Z</h2>
          Spellings & Example Words:
          <ul>
            <li>z: zone, zero, zoo, zipper, zebra</li>
            <li>ze: bronze, seize, analyze</li>
            <li>zz: jazz, puzzle, drizzle</li>
            <li>se: house (verb), rose</li>
            <li>s: his, was, houses, music</li>
            <li>x: xylophone, Xerox, xylophone</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: z</li>
            <li>Phonemic: /z/</li>
            <li>
              Phonetic / Allophones:
              <ul>
                <li>[z] - most common</li>
                <li>
                  [z̥] or [s] - in some cases, such as &quot;dogs&quot; when
                  phrase final or followed by a voiceless consonant it
                </li>
              </ul>
            </li>
          </ul>
          <h2 id="SH">SH</h2>
          Spellings & Example Words:
          <ul>
            <li>sh: shoe, shot, shin, share</li>
            <li>ch: chef, machine, champagne, chauvinistic</li>
            <li>s: sugar, sure</li>
            <li>ss: issue, pressure, tissue</li>
            <li>sci: omniscient</li>
            <li>sch: schmooze, schwa, schtick, schmuck</li>
            <li>ti: nation, motion, action, cautious</li>
            <li>ci: social, special, musician</li>
            <li>xi (can become K+SH): anxious, luxury</li>
            <li>tu: actual, virtual</li>
            <li>si: tension, mansion</li>
            <li>ci: suspicion</li>
            <li>ssi: mission, passion</li>
            <li>shi: fashion, cushion</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: sh</li>
            <li>Phonemic: /ʃ/</li>
            <li>Phonetic: [ʃ]</li>
          </ul>
          <h2 id="ZH">ZH</h2>
          Spellings & Example Words:
          <ul>
            <li>z: azure, seizure</li>
            <li>
              s: vision, precision, Asia, treasure, casual, usual, measure,
              pleasure
            </li>
            <li>ge: beige, camouflage, garage, massage, triage, mirage</li>
            <li>g: genre</li>
            <li>j: Jacques, Elijah</li>
            <li>x (can become G + ZH): luxury</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: zh</li>
            <li>Phonemic: /ʒ/</li>
            <li>Phonetic: [ʒ]</li>
          </ul>
          <h2 id="H">H</h2>
          Spellings & Example Words:
          <ul>
            <li>h: hi, hello</li>
            <li>wh: who, whole</li>
            <li>j: jalapeño, Jalisco, José</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: h</li>
            <li>Phonemic: /h/</li>
            <li>Phonetic: [h]</li>
          </ul>
          <h2 id="L">L</h2>
          Spellings & Example Words:
          <ul>
            <li>l: like, sail, love, long</li>
            <li>ll: hello, yellow, full, Lloyd, llama, ball, wall</li>
            <li>le: table, middle, kale, file, bottle, juggle, little</li>
            <li>vowel + L: see below...</li>
            <li>al: cymbal, medal, metal, hospital, festival</li>
            <li>el: tunnel, model, level, travel, towel</li>
            <li>il: pupil, fossil</li>
            <li>ol: symbol, pistol</li>
            <li>ul: useful, thoughtful</li>
            <li>yl: pterodactyl, ethyl, Beryl</li>
            <li>ile: mobile, missile, hostile, juvenile</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: l</li>
            <li>Phonemic: /l/</li>
            <li>
              Phonetic / Allophones:
              <ul>
                <li>
                  Traditionally represented like this:
                  <ul>
                    <li>[l] - clear/light L, when syllable initial</li>
                    <li>[ɫ] - dark L, when syllable final</li>
                  </ul>
                </li>
              </ul>
              <ul>
                <li>
                  However, I&apos;d argue it&apos;s a dark L in both syllable
                  positions, and what varies is tongue tip contact. IPA is TBD:
                  <ul>
                    <li>[ɫ] - when syllable initial, tongue tip is required</li>
                    <li>
                      [ɫ] - when syllable final, no tongue tip contact required
                      unless followed by a vowel
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
          <h2 id="R">R</h2>
          Spellings & Example Words:
          <ul>
            <li>r: red, car, run, right</li>
            <li>rr: arrest, burrito, mirror, hurry</li>
            <li>re: bore, dare, care</li>
            <li>wr: write, wrong, wrist, wrestle</li>
            <li>rh: rhyme, rhythm, rhombus, Rhine, rhetoric</li>
            <li>rrh: diarrhea, hemorrhage</li>
            <li>vowel + R: her, work, bird</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: r</li>
            <li>Phonemic: /r/</li>
            <li>Phonetic / Allophones: [ɹ̈], [ɹ̠]</li>
          </ul>
          <h2 id="W">W</h2>
          Spellings & Example Words:
          <ul>
            <li>w: water, wind, world, winter</li>
            <li>wh: what, when, where, why</li>
            <li>u: quick, quit, quiet, quite, linguist</li>
            <li>o (can become W + vowel): one, once, choir</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: w</li>
            <li>Phonemic: /w/</li>
            <li>Phonetic: [w]</li>
          </ul>
          <h2 id="Y">Y</h2>
          Spellings & Example Words:
          <ul>
            <li>y: yes, you, young, yam, year, yeast, yell, yellow</li>
            <li>
              (null): document, accuse, procure, million, volume, value, onion,
              union, opinion, Europe, eulogy
            </li>
            <li>j: fjord, Johan</li>
          </ul>
          <br />
          Audio: TBD
          <br />
          Symbols / representations:
          <ul>
            <li>Respelling: y</li>
            <li>Phonemic: /j/</li>
            <li>Phonetic: [j]</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
