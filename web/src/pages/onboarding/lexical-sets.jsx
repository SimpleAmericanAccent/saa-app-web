import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

**Nossa! 😱**  
This kind of thing happens a little in Portuguese (like ela vs ele, or ovo vs ovos), but it's way more consistent and predictable.
In English? Things get messy fast.

## 💡 The Solution: Lexical Sets
Lexical sets help us start to organize this chaos.

Instead of focusing on how a word is spelled, we focus on how it sounds.
Lexical sets group together words that share the same vowel sound — no matter how they're spelled.

> This is how babies learn language — they start with the sounds, not the spelling.
> But adult learners often do the opposite — they rely too much on letters.

Let's flip that. Let's learn more like babies.
Try to "forget" the spelling for a moment, and really listen to the sounds.
Spelling might give you clues… but learning to identify vowels by sound is a key skill in mastering an American accent.

## 🗂️ How Lexical Sets Work
Let's take a word like sick.
We can group all the other words with the same vowel sound into the same category:

### 🟠 Group 1:
\`sick, women, it, did, if, this, myth, business, fish, build, building…\`

Then we take a word like seek, and build another group:

### 🔵 Group 2:
\`seek, he, me, she, we, sea, see, seize, ski, piece…\`

Each of these groups is a lexical set — a collection of words that share the same vowel sound, regardless of how they're spelled.

## 🏷️ Naming the Sets: Keywords
To make these vowel categories easier to talk about, linguists assign each one a keyword — a single word that clearly contains the vowel sound of that group.

This system was created by the British phonetician John C. Wells, and his list of keywords is still widely used in linguistics and pronunciation teaching today.

So:

- Group 1 (like sick) is called the **KIT** set.
- Group 2 (like seek) is called the **FLEECE** set.

Each keyword represents the vowel sound in its set.
So the word kit contains the KIT vowel, and fleece contains the FLEECE vowel.

> 👉 These keywords might seem a little random at first, but they're carefully chosen to be distinct from each other — and they're worth learning.

## ✅ Why This Matters
If you want to master the American accent, you can’t trust spelling alone.

You need to train your ear to recognize the actual sounds — and lexical sets (with their helpful keywords) give you a reliable, consistent way to do that.
`;

export default function LexicalSets() {
  return (
    <div className="container mx-auto p-4 prose prose-invert max-w-3xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold mb-8" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-semibold mb-4 mt-8" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-medium mb-3 mt-6" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p
              className="text-muted-foreground mb-4 leading-relaxed"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-2 mb-6" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-muted-foreground" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground"
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
                className="block bg-muted p-4 rounded-lg my-4 text-sm"
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
    </div>
  );
}
