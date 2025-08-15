import React, { useState, useEffect } from "react";
import { Button } from "core-frontend-web/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "core-frontend-web/src/components/ui/card";
import { X, Download, Share } from "lucide-react";

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
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

    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-last-shown", Date.now().toString());
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-last-shown", Date.now().toString());
  };

  // For development - clear localStorage to test prompt
  const clearPromptHistory = () => {
    localStorage.removeItem("pwa-prompt-last-shown");
    console.log("PWA prompt history cleared");
  };

  const handleIOSInstall = () => {
    // For iOS, we show instructions
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-last-shown", Date.now().toString());
  };

  // For development/testing - show a test button
  const isDev = import.meta.env.DEV;

  if (!showPrompt && !isDev) {
    return null;
  }

  // Show test button in development
  if (isDev && !showPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
        <Card className="shadow-lg border-2 border-blue-500">
          <CardContent className="p-3 space-y-2">
            <Button
              onClick={() => setShowPrompt(true)}
              className="w-full text-xs h-8"
              size="sm"
              variant="outline"
            >
              🧪 Test PWA Prompt
            </Button>
            <Button
              onClick={clearPromptHistory}
              className="w-full text-xs h-6"
              size="sm"
              variant="ghost"
            >
              Clear History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-2">
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
                ? "Add this app to your home screen for quick access and offline use."
                : "Install this app for quick access and offline use."}
            </p>

            {isIOS ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Share className="h-4 w-4" />
                  <span>Tap the share button</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Download className="h-4 w-4" />
                  <span>Select "Add to Home Screen"</span>
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
