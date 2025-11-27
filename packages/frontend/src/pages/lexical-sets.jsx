import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";
import { Button } from "frontend/src/components/ui/button";

const markdownContent = `
# 🧩 Understanding Lexical Sets

## 🔍 The Problem
Vowels in English are confusing and inconsistent.

### Same vowel *letters*, different vowel *sounds*:
- "Bear" and "beard" have different vowel sounds, even though they share the same letters.
- "Steak" and "bread" each have other vowel sounds entirely.

### Different vowel *letters*, same vowel sound:
- "Sick" has the vowel letter i.
- "Women" has o and e.
- But they all share the same vowel sound.
 
This kind of thing happens a little in Portuguese (like ela vs ele, or ovo vs ovos), but it's way more consistent and predictable.
In English? Things get messy fast.

## 💡 The Solution: Lexical Sets
Lexical sets help us start to organize this chaos.

Instead of focusing on how a word is spelled, we focus on how it sounds.
Lexical sets group together words that share the same vowel sound - no matter how they're spelled.

This is how babies learn language - they start with the sounds, not the spelling.
But adult learners often do the opposite - they rely too much on letters.

Let's flip that. Let's learn more like babies.
Try to "forget" the spelling for a moment, and really listen to the sounds.
Spelling might give you clues… but learning to identify vowels by sound is a key skill in mastering an American accent.

## 🗂️ How Lexical Sets Work
Let's take a word like "sick."
We can group all the other words with the same vowel sound into the same category:

### 🟠 Group 1 (KIT)
\`\`\`js
sick, women, it, did, if, this, myth, business, fish, build, building…
\`\`\`

Then we take a word like "seek," and build another group:

### 🔵 Group 2 (FLEECE)
\`\`\`js
seek, he, me, she, we, sea, see, seize, ski, piece…
\`\`\`

Each of these groups is a lexical set - a collection of words that share the same vowel sound, regardless of how they're spelled.

## 🏷️ Naming the Sets: Keywords
To make these vowel categories easier to talk about, linguists assign each one a keyword - a single word that clearly contains the vowel sound of that group.

This system was created by the British phonetician John C. Wells, and his list of keywords is still widely used in linguistics and pronunciation teaching today.

So:

- Group 1 (like sick) is called the **KIT** set.
- Group 2 (like seek) is called the **FLEECE** set.

Each keyword represents the vowel sound in its set.
So the word kit contains the KIT vowel sound, and fleece contains the FLEECE vowel sound.

> 👉 Why use "KIT" and "FLEECE" instead of simpler words? 
>
> Consider if we had used "bit" and "beat" instead. 
> These words are similar enough that it can be confusing if we're trying to verbally tell someone which lexical set we're referring to...
> ... especially if we're talking with someone with a different accent where the vowel sounds are different.
>
> That's why we use keywords like "KIT" and "FLEECE" that sound completely different from each other.
> Even when communicating with people with different accents, the keywords are different enough that it's clear which lexical set we're referring to. 

## ✅ Why This Matters
If you want to master the American accent, you can't trust spelling alone.

You need to train your ear to recognize the actual sounds — and lexical sets (with their helpful keywords) give you a reliable, consistent way to do that.

Speaking of which, I created a quiz to help you test & train your ability to hear the differences between lexical sets.
`;

export default function LexicalSets() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 prose prose-invert w-screen">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 mt-4 sm:mt-6"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p
              className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-inside space-y-1 sm:space-y-2 mb-4 sm:mb-6"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li
              className="text-sm sm:text-base text-muted-foreground"
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-primary pl-3 sm:pl-4 my-3 sm:my-4 italic text-sm sm:text-base text-muted-foreground"
              {...props}
            />
          ),
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm"
                {...props}
              />
            ) : (
              <code
                className="block bg-muted p-2 sm:p-4 rounded-lg my-4 text-xs sm:text-sm overflow-x-auto"
                {...props}
              />
            ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-primary" {...props} />
          ),
        }}
      >
        {markdownContent}
      </ReactMarkdown>

      <div className="flex justify-center mt-4">
        <Button
          variant="outline"
          size="lg"
          className="text-base px-8 py-3 cursor-pointer"
          onClick={() => navigate("/quiz")}
        >
          Take the Lexical Sets Quiz →
        </Button>
      </div>
    </div>
  );
}
