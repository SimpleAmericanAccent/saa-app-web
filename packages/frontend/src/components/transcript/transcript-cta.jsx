import React, { useState } from "react";
import { Button } from "frontend/src/components/ui/button";
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
} from "frontend/src/components/ui/dialog";

export default function TranscriptCTA({
  variant = "floating", // "floating", "selector", "bottom"
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(true);
  const [selectedCall, setSelectedCall] = useState(false);

  const whatsappNumber = "13194576479";
  const stripePaymentLink = "https://buy.stripe.com/3cIbJ0fEn5di6k315k6Zy2e";

  // Interactive pricing logic
  const getSelectedPrice = () => {
    if (selectedAnalysis && selectedCall) return "$500";
    if (selectedAnalysis && !selectedCall) return "$200";
    if (!selectedAnalysis && selectedCall) return "$300";
    return "$0";
  };

  const getSelectedFeatures = () => {
    const features = [];
    if (selectedAnalysis) {
      features.push("I analyze up to 3 min of audio");
      features.push("Clarifications via WhatsApp");
    }
    if (selectedCall) {
      features.push("We prioritize your issues");
      features.push("1:1 Zoom call to practice/plan");
    }
    return features;
  };

  const getSelectedDescription = () => {
    if (selectedAnalysis && selectedCall) return "Analysis plus 1:1 call";
    if (selectedAnalysis && !selectedCall)
      return "Appears in transcript viewer";
    if (!selectedAnalysis && selectedCall) return "1:1 Zoom call";
    return "Select what you need";
  };

  const getSelectedLink = () => {
    if (selectedAnalysis && selectedCall)
      return "https://calendly.com/callsaa/paa";
    if (selectedAnalysis && !selectedCall)
      return "https://buy.stripe.com/dRmdR863N35a37R6pE6Zy2f";
    if (!selectedAnalysis && selectedCall)
      return "https://calendly.com/callsaa/50";
    return null;
  };

  const getSelectedButtonText = () => {
    if (selectedAnalysis && selectedCall) return "Book Now";
    if (selectedAnalysis && !selectedCall) return "Buy Now";
    if (!selectedAnalysis && selectedCall) return "Book Now";
    return "Select Options";
  };

  const getSelectedWhatsappMessage = () => {
    if (selectedAnalysis && selectedCall)
      return "Hi Will! I'm interested in the Personal Accent Analysis + 1:1 Call for $500.";
    if (selectedAnalysis && !selectedCall)
      return "Hi Will! I'm interested in just the Personal Accent Analysis for $200.";
    if (!selectedAnalysis && selectedCall)
      return "Hi Will! I'm interested in just the 1:1 Coaching Call for $300.";
    return "Hi Will! I'm interested in your services.";
  };

  const offers = [
    {
      id: "mentorship-group",
      title: "Mentorship Group",
      price: "",
      description: "My core program",
      features: [
        "Personal Accent Analyses",
        "Group Zoom calls & replays",
        "Some 1:1 calls/support",
        "Group WhatsApp support",
      ],
      externalLink:
        "https://simpleamericanaccent.com/mg?utm_source=saa_web_app&utm_medium=web_app&utm_campaign=transcript_viewer",
    },
    {
      id: "1on1-packages",
      title: "1:1 Packages",
      price: "",
      description: "1:1 coaching packages",
      features: [
        "Personal Accent Analyses",
        "1:1 Zoom Calls",
        "1:1 WhatsApp support",
        "Flexible scheduling",
      ],
      externalLink:
        "https://simpleamericanaccent.com/1on1?utm_source=saa_web_app&utm_medium=web_app&utm_campaign=transcript_viewer",
    },
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
        "I analyze up to 3 min of audio",
        "We prioritize your issues",
        "1:1 Zoom call to practice/plan",
      ],
      calendlyLink: "https://calendly.com/callsaa/paa",
      whatsappMessage:
        "Hi Will! I'm interested in the Personal Accent Analysis + 1:1 Call for $500.",
    },
    {
      id: "analysis-only",
      title: "Personal Accent Analysis (No Call)",
      price: "$200",
      description: "Appears in transcript viewer",
      features: [
        "I analyze up to 3 min of audio",
        "Clarifications via WhatsApp",
        "No additional call included",
      ],
      stripeLink: "https://buy.stripe.com/dRmdR863N35a37R6pE6Zy2f",
      whatsappMessage:
        "Hi Will! I'm interested in just the Personal Accent Analysis for $200.",
    },
    {
      id: "call-only",
      title: "1:1 Call (No Analysis)",
      price: "$300",
      description: "1:1 Zoom call",
      features: [""],
      calendlyLink: "https://calendly.com/callsaa/50",
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
                rel="noopener"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Questions About My Analysis
              </a>
            </Button>
          </div>
        </div>

        {/* Right: Paid Offers Section */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Want more help?</h4>
          </div>

          {/* Top Row: Mentorship Group and 1:1 Packages */}
          <div className="grid grid-cols-2 gap-3">
            {/* Mentorship Group */}
            {(() => {
              const offer = offers.find((o) => o.id === "mentorship-group");
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
                        href={offer.externalLink}
                        target="_blank"
                        rel="noopener"
                      >
                        Learn More
                      </a>
                    </Button>
                  </div>
                </div>
              ) : null;
            })()}

            {/* 1:1 Packages */}
            {(() => {
              const offer = offers.find((o) => o.id === "1on1-packages");
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
                        href={offer.externalLink}
                        target="_blank"
                        rel="noopener"
                      >
                        Learn More
                      </a>
                    </Button>
                  </div>
                </div>
              ) : null;
            })()}
          </div>

          {/* Interactive Pricing Component */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4 space-y-4">
              <h5 className="font-medium text-sm">Or buy a la carte:</h5>

              {/* Selection Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="analysis"
                    checked={selectedAnalysis}
                    onChange={(e) => setSelectedAnalysis(e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                  />
                  <label
                    htmlFor="analysis"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Personal Accent Analysis ($200)
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="call"
                    checked={selectedCall}
                    onChange={(e) => setSelectedCall(e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                  />
                  <label
                    htmlFor="call"
                    className="text-sm font-medium cursor-pointer"
                  >
                    1:1 Zoom Call ($300)
                  </label>
                </div>
              </div>

              {/* Dynamic Price and Features */}
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-medium text-sm">Your Selection</h6>
                  <span className="text-lg font-semibold text-green-600">
                    {getSelectedPrice()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {getSelectedDescription()}
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                  {getSelectedFeatures().map((feature, idx) => (
                    <li key={idx}>• {feature}</li>
                  ))}
                </ul>

                {/* Action Button */}
                {getSelectedLink() ? (
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 !text-white text-xs"
                  >
                    <a href={getSelectedLink()} target="_blank" rel="noopener">
                      {getSelectedButtonText()}
                    </a>
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-gray-400 !text-white text-xs cursor-not-allowed"
                    disabled
                  >
                    <span>{getSelectedButtonText()}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Questions About Offers */}
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
                  rel="noopener"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Ask Questions
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
      <DialogContent className="w-[90vw] !max-w-4xl max-h-[95vh] overflow-y-auto z-[9999] [&>button]:cursor-pointer">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
