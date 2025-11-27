import React from "react";
import { Button } from "frontend/src/components/ui/button";
import { MessageCircle } from "lucide-react";

export default function Join() {
  const stripePaymentLink = "https://buy.stripe.com/3cIbJ0fEn5di6k315k6Zy2e";
  const whatsappNumber = "13194576479";
  const message = encodeURIComponent(
    "Hi Will! I'm already in your app and am considering upgrading to the $2k program, but I have some questions before joining. [Insert your question(s) here]"
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-3">Join the Program</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Unlock call replays, live access to 4 group Zoom calls over 2
            months, and 1:1 support.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-lg border p-6">
            <h2 className="font-semibold text-lg mb-2">What's Included</h2>
            <ul className="space-y-2 text-sm text-left">
              <li>• Access to selected call replays</li>
              <li>• 4 live group Zoom calls over 2 months</li>
              <li>• Each call: lesson + Q&A / live coaching on the topic</li>
              <li>
                • Each call has a different topic: vowels, consonants, flow,
                smart practice
              </li>
            </ul>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="font-semibold text-lg mb-2">Schedule</h2>
            <p className="text-sm text-left mb-2">
              Typically every other Wednesday at
            </p>
            <ul className="space-y-1 text-sm text-left">
              <li>• 9:00 AM Central</li>
              <li>• 6:00 PM Central</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">
              Morning and evening sessions on a given day cover the same
              topic—attend whichever time works.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="font-semibold text-lg mb-2">
              Onboarding & Follow‑up
            </h2>
            <ul className="space-y-2 text-sm text-left">
              <li>• Onboarding: Personal Accent Analysis + 1:1 Call</li>
              <li>
                • End of Month 1: Follow‑up Personal Accent Analysis + 1:1 Call
                (progress check, troubleshooting)
              </li>
              <li>
                • End of Month 2: Follow‑up Personal Accent Analysis + 1:1 Call
                (progress check, next steps)
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border p-6 text-center">
          <p className="text-2xl font-semibold mb-2">$2000 USD</p>
          <p className="text-sm text-muted-foreground mb-6">
            One-time payment. I'll manually unlock your access ASAP after
            confirming payment.
          </p>
          <Button
            asChild
            className="bg-green-600 hover:bg-green-700 !text-white"
          >
            <a href={stripePaymentLink} target="_blank" rel="noopener">
              Checkout Securely
            </a>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            After payment you'll be redirected to a thank-you page, including
            how to send me a WhatsApp message or email to get your access
            unlocked faster.
          </p>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground mb-2">
            Have questions before joining?
          </p>
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <a href={whatsappUrl} target="_blank" rel="noopener">
              <MessageCircle className="w-3 h-3" />
              Ask on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
