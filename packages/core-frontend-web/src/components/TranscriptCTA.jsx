import React, { useState } from "react";
import { Button } from "core-frontend-web/src/components/ui/button";
import {
  MessageCircle,
  User,
  FileText,
  Target,
  Users,
  Mic,
  Hand,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "core-frontend-web/src/components/ui/dialog";

export default function TranscriptCTA({
  variant = "floating", // "floating", "selector", "bottom"
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = "13194576479";
  const stripePaymentLink = "https://buy.stripe.com/3cIbJ0fEn5di6k315k6Zy2e";

  const offers = [
    {
      id: "whatsapp-support",
      title: "WhatsApp Support",
      price: "Free",
      description: "Questions about your existing transcript/accent analysis",
      features: [
        "Clarify issues highlighted in your analysis",
        "Questions about what you're seeing in transcript viewer",
        "Responses when I have time available",
        "No appointment needed",
      ],
      whatsappMessage:
        "Hi Will! I have questions about my transcript/accent analysis and would love clarification.",
    },
    {
      id: "full-analysis",
      title: "Personal Accent Analysis + 1:1 Call",
      price: "$500",
      description: "Analysis plus 1:1 call",
      features: [
        "1-hour 1:1 video call to discuss findings",
        "Help prioritize which issues to focus on first",
        "Talk through practice strategies for your specific issues",
      ],
      calendlyLink: "https://calendly.com/callsaa/paa",
      whatsappMessage:
        "Hi Will! I'm interested in the Personal Accent Analysis + 1:1 Call for $500.",
    },
    {
      id: "analysis-only",
      title: "Personal Accent Analysis Only (No Call)",
      price: "$200",
      description: "Analysis appears in your transcript viewer",
      features: [
        "See your specific pronunciation issues highlighted",
        "No additional call included",
      ],
      whatsappMessage:
        "Hi Will! I'm interested in just the Personal Accent Analysis for $200.",
    },
    {
      id: "call-only",
      title: "1:1 Call Only (No Analysis)",
      price: "$300",
      description: "1:1 Zoom coaching session to use as you wish",
      features: [
        "1-hour 1:1 video call",
        "Focused coaching",
        "Practice together",
      ],
      calendlyLink: "https://calendly.com/callsaa/1",
      whatsappMessage:
        "Hi Will! I'm interested in just the 1:1 Coaching Call for $300.",
    },
  ];

  const renderContent = () => (
    <div className="space-y-4">
      {/* Left-Right Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Free Support Section */}
        <div className="space-y-4">
          <h4 className="font-medium">
            Need Clarification About Your Existing Transcripts/Analysis?
          </h4>
          <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">WhatsApp Support</h5>
              <span className="text-lg font-semibold text-green-600">Free</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Questions about your existing transcript/accent analysis
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Clarify issues highlighted in your analysis</li>
              <li>• Questions about what you're seeing in transcript viewer</li>
              <li>• Responses when I have time available</li>
              <li>• No appointment needed</li>
            </ul>
            <Button
              asChild
              className="w-full bg-green-600 hover:bg-green-700 !text-white"
            >
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  "Hi Will! I have questions about my transcript/accent analysis and would love clarification. [Insert your question(s) here]"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Questions About My Analysis
              </a>
            </Button>
          </div>
        </div>

        {/* Right: Paid Offers Section - 2x2 Grid */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">
              Want more analysis/help beyond that?
            </h4>
            <p className="text-sm text-muted-foreground">
              Send me up to 3 minutes of audio via WhatsApp and I'll personally
              analyze your accent patterns within the transcript viewer:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Top Left: PAA + 1:1 */}
            {(() => {
              const offer = offers.find((o) => o.id === "full-analysis");
              return offer ? (
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm">{offer.title}</h5>
                    <span className="text-lg font-semibold text-green-600">
                      {offer.price}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {offer.description}
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {offer.features.map((feature, idx) => (
                      <li key={idx}>• {feature}</li>
                    ))}
                  </ul>
                  <div className="pt-2">
                    {offer.stripeLink && (
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700 !text-white text-xs"
                      >
                        <a
                          href={offer.stripeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Buy Now
                        </a>
                      </Button>
                    )}
                    {offer.calendlyLink && (
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700 !text-white text-xs"
                      >
                        <a
                          href={offer.calendlyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Book Now
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Top Right: PAA Only */}
            {(() => {
              const offer = offers.find((o) => o.id === "analysis-only");
              return offer ? (
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm">{offer.title}</h5>
                    <span className="text-lg font-semibold text-green-600">
                      {offer.price}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {offer.description}
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {offer.features.map((feature, idx) => (
                      <li key={idx}>• {feature}</li>
                    ))}
                  </ul>
                  <div className="pt-2">
                    <Button
                      asChild
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 !text-white text-xs"
                    >
                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                          offer.whatsappMessage
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Contact
                      </a>
                    </Button>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Bottom Left: 1:1 Only */}
            {(() => {
              const offer = offers.find((o) => o.id === "call-only");
              return offer ? (
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm">{offer.title}</h5>
                    <span className="text-lg font-semibold text-green-600">
                      {offer.price}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {offer.description}
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {offer.features.map((feature, idx) => (
                      <li key={idx}>• {feature}</li>
                    ))}
                  </ul>
                  <div className="pt-2">
                    {offer.calendlyLink ? (
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700 !text-white text-xs"
                      >
                        <a
                          href={offer.calendlyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Book Now
                        </a>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700 !text-white text-xs"
                      >
                        <a
                          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                            offer.whatsappMessage
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Contact
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Bottom Right: Questions About Offers */}
            <div className="border rounded-lg p-3 flex flex-col justify-center items-center space-y-2">
              <h5 className="font-medium text-sm text-center">
                Still have questions?
              </h5>
              <p className="text-xs text-muted-foreground text-center">
                Ask about any of these offers
              </p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    "Hi Will! I'm in the Transcript Viewer and am considering buying more analysis/support, but have some questions about the offers. [Insert your question(s) here]"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Ask Questions
                </a>
              </Button>
            </div>
          </div>

          {/* Full Programs Section */}
          <div className="pt-4 border-t border-border">
            <h5 className="font-medium text-sm mb-2">
              Ready for a full program?
            </h5>
            <div className="space-y-2">
              <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h6 className="font-medium text-sm">Fundamentals Program</h6>
                  <span className="text-lg font-semibold text-green-600">
                    $2,000
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Access to live group calls, selected call replays, and 1:1
                  support
                </p>
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 !text-white text-xs"
                >
                  <a
                    href="https://buy.stripe.com/3cIbJ0fEn5di6k315k6Zy2e"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Program
                  </a>
                </Button>
              </div>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="w-full text-xs"
              >
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    "Hi Will! I'm interested in learning about your other programs (VIP, 6-12 month Mentorship Group, etc.). Can you tell me more about what's available?"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  View All Programs & Pricing
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrigger = () => {
    if (variant === "floating") {
      return (
        <Button
          className="rounded-full w-12 h-12 bg-green-600 hover:bg-green-700 shadow-lg cursor-pointer"
          size="sm"
          title="Need clarification or more help?"
        >
          <Hand className="!w-6 !h-6" />
        </Button>
      );
    }

    if (variant === "selector") {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center cursor-pointer"
        >
          <Hand className="w-4 h-4 mr-2" />
          Need clarification or more help?
        </Button>
      );
    }

    if (variant === "bottom") {
      return (
        <Button variant="outline" className="w-full">
          <Hand className="w-4 h-4 mr-2" />
          Get personalized coaching for your accent?
        </Button>
      );
    }

    return null;
  };

  const renderContainer = (content) => {
    if (variant === "floating") {
      return <div className={`${className}`}>{content}</div>;
    }

    if (variant === "selector") {
      return (
        <div
          className={`border border-border rounded-md p-0 bg-muted/30 ${className}`}
        >
          {content}
        </div>
      );
    }

    if (variant === "bottom") {
      return (
        <div className={`mt-8 p-4 border-t border-border ${className}`}>
          {content}
        </div>
      );
    }

    return content;
  };

  return renderContainer(
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{renderTrigger()}</DialogTrigger>
      <DialogContent className="w-[90vw] !max-w-4xl max-h-[90vh] overflow-y-auto z-[9999]">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
