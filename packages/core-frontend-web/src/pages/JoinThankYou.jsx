import React from "react";
import { Button } from "core-frontend-web/src/components/ui/button";

export default function JoinThankYou() {
  const whatsappNumber = "13194576479";
  const message = encodeURIComponent(
    "Hi Will! I just joined your program via the checkout inside the SAA app. Can you unlock my access and tell me next steps?"
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="p-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Program!</h1>
        <p className="text-lg text-muted-foreground mb-6">
          You made a great choice. I'll personally get you set up and unlock
          your access ASAP.
        </p>

        <Button asChild className="bg-green-600 hover:bg-green-700 !text-white">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Message Me on WhatsApp
          </a>
        </Button>

        <p className="text-sm text-muted-foreground mt-6">
          Prefer email? Reply to your receipt and I'll get you onboarded. Either
          way, reaching out speeds up the access unlock process.
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          Looking forward to this journey together!
          <br />
          <br />- Will from Simple American Accent
        </p>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>P.S.</strong> In case you haven't seen it yet, here's a
            simple 2-page PDF with 10 of the most common vowel and consonant
            contrasts that Brazilians typically mess up (even Brazilians who are
            advanced in English).
          </p>
          <a
            href="https://saa-assets.s3.us-east-2.amazonaws.com/lead_magnets/top10.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Direct link to the Top 10 Guide →
          </a>
        </div>
      </div>
    </div>
  );
}
