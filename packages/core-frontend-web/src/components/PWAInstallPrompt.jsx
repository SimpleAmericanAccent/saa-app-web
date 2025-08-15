import React, { useState, useEffect } from "react";
import { Button } from "core-frontend-web/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "core-frontend-web/src/components/ui/card";
import { X, Download, Share, Square } from "lucide-react";

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const checkStandalone = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
      );
    };

    // Check if iOS Safari
    const checkIOS = () => {
      return (
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        /Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent)
      );
    };

    const standalone = checkStandalone();
    const ios = checkIOS();

    setIsStandalone(standalone);
    setIsIOS(ios);

    // Check if we've already shown the prompt recently
    const lastShown = localStorage.getItem("pwa-prompt-last-shown");
    const hasShownRecently =
      lastShown && Date.now() - parseInt(lastShown) < 7 * 24 * 60 * 60 * 1000; // 7 days

    // Debug logging
    console.log("PWA Install Prompt Debug:", {
      userAgent: navigator.userAgent,
      isIOS: ios,
      isStandalone: standalone,
      hasShownRecently,
      showPrompt: false,
    });

    if (hasShownRecently) {
      setHasShownPrompt(true);
    }

    // Listen for beforeinstallprompt event (Android Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show prompt after a delay if not already shown
      if (!hasShownRecently && !standalone) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000); // 3 second delay
      }
    };

    // Show iOS prompt after delay if not already shown
    if (ios && !standalone && !hasShownRecently) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // 3 second delay
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []); // Empty dependency array - only run once on mount

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android Chrome
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("PWA installed successfully");
      }
      setDeferredPrompt(null);
    }

    setIsClosing(true);
    setIsOpening(false);
    setTimeout(() => {
      setShowPrompt(false);
      setIsClosing(false);
    }, 500);
    localStorage.setItem("pwa-prompt-last-shown", Date.now().toString());
  };

  const handleDismiss = () => {
    setIsClosing(true);
    setIsOpening(false);
    setTimeout(() => {
      setShowPrompt(false);
      setIsClosing(false);
    }, 500);
    localStorage.setItem("pwa-prompt-last-shown", Date.now().toString());
  };

  // For development - clear localStorage to test prompt
  const clearPromptHistory = () => {
    localStorage.removeItem("pwa-prompt-last-shown");
    console.log("PWA prompt history cleared");
  };

  const handleIOSInstall = () => {
    // For iOS, we show instructions
    setIsClosing(true);
    setIsOpening(false);
    setTimeout(() => {
      setShowPrompt(false);
      setIsClosing(false);
    }, 500);
    localStorage.setItem("pwa-prompt-last-shown", Date.now().toString());
  };

  // For development/testing - show a test button
  const isDev = import.meta.env.DEV;

  // Show persistent install icon when prompt is not shown
  if (!showPrompt) {
    // Don't show if already in standalone mode
    if (isStandalone) {
      return null;
    }

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => {
            setShowPrompt(true);
            // Delay the opening animation to allow initial render
            setTimeout(() => setIsOpening(true), 10);
          }}
          className={`w-8 h-8 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-500 ease-in-out hover:scale-110 ${
            isClosing ? "opacity-0 scale-0" : "opacity-70 scale-100"
          }`}
          size="sm"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
        </Button>
      </div>
    );
  }

  if (isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card
        className={`shadow-lg border-2 gap-2 py-4 transition-all duration-500 ease-in-out ${
          isClosing
            ? "opacity-0 scale-0 origin-bottom-right"
            : isOpening
            ? "opacity-100 scale-100 origin-bottom-right"
            : "opacity-0 scale-0 origin-bottom-right"
        }`}
      >
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Install App</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {isIOS
                ? "Add this to your home screen as an app for quicker access."
                : "Install this app for quicker access."}
            </p>

            {isIOS ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center justify-center w-8 h-8 bg-muted rounded">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
                      </svg>
                    </div>
                    <span className="font-medium">
                      Step 1: Tap the share button in the <br /> bottom center
                      of Safari's toolbar
                    </span>
                  </div>
                  <div className="mx-auto text-xs text-muted-foreground">
                    <div className="ml-4 mt-1 p-2 bg-muted/50 rounded border border-dashed border-muted-foreground/30">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                          <svg
                            className="h-3 w-3 text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center justify-center w-8 h-8 bg-muted rounded">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M12 8v8M8 12h8"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">
                      Step 2: Scroll down and select
                      <br /> "Add to Home Screen"
                    </span>
                  </div>
                  <div className="mx-auto text-xs text-muted-foreground">
                    <div className="ml-4 mt-1 p-2 bg-muted/50 rounded border border-dashed border-muted-foreground/30">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-500 font-medium">
                            Add to Home Screen
                          </span>
                          <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                            <svg
                              className="h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M12 6v12M6 12h12"
                                stroke="white"
                                strokeWidth="3"
                                fill="none"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleIOSInstall}
                  className="w-full text-xs h-8"
                  size="sm"
                >
                  Got it
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleInstall}
                className="w-full text-xs h-8"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Install App
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
