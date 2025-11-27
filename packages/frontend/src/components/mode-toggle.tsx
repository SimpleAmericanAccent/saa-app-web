import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "frontend/src/components/ui/button";
import { useTheme } from "frontend/src/components/theme-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "frontend/src/components/ui/tooltip";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="cursor-pointer"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" align="center">
        {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      </TooltipContent>
    </Tooltip>
  );
}
