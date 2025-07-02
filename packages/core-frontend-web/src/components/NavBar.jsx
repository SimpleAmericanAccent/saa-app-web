import { Link } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "core-frontend-web/src/stores/authStore";
import { ModeToggle } from "./mode-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "core-frontend-web/src/components/ui/navigation-menu";
import { cn } from "core-frontend-web/src/lib/utils";
import { SidebarTrigger } from "core-frontend-web/src/components/ui/sidebar";
import useVersionStore from "core-frontend-web/src/stores/versionStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "core-frontend-web/src/components/ui/dropdown-menu";
import { Check } from "lucide-react";

function NavBar({ showSidebarTrigger = false }) {
  const { isAdmin, isLoading, fetchAdminStatus, logout } = useAuthStore();
  const { version, setVersion } = useVersionStore();

  useEffect(() => {
    fetchAdminStatus();
  }, [fetchAdminStatus]);

  if (isLoading) {
    return (
      <div className="min-h-[var(--navbar-height)] max-h-[var(--navbar-height)] sticky bg-background top-0 border-b z-50 px-4 flex items-center justify-between">
        Loading...
      </div>
    );
  }

  return (
    <nav className="min-h-[var(--navbar-height)] max-h-[var(--navbar-height)] sticky bg-background top-0 border-b z-50 px-4 flex items-center justify-between">
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link
              to="/dashboard"
              className={cn(navigationMenuTriggerStyle(), "cursor-pointer")}
            >
              Dashboard
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link
              to="/transcript"
              className={cn(navigationMenuTriggerStyle(), "cursor-pointer")}
            >
              Transcript Viewer
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Vowels</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2">
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/onboarding/lexical-sets"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        Lexical Sets
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground">
                        Learn how vowels are organized into sound-based
                        categories, independent of spelling.
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/onboarding/lexical-sets-quiz"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        Lexical Sets Quiz
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground">
                        Test your knowledge of lexical sets with interactive
                        exercises.
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/spelling-pronunciation"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        Spelling-Pronunciation Network
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Interactive visualization of spelling-pronunciation
                        relationships
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                {/* <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/learn/vowels"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        Vowels
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Exploration of vowels
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li> */}

                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/vsounds"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        Vowel Sounds
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Interactive vowel sound examples
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>

                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/vsynth"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        Vowel Synthesizer
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Generate and explore vowel sounds
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/replays/vowels"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        Vowel Call Replays
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Selected call recordings from our Fundamentals trainings
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Consonants</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2">
                {/* <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/learn/consonants"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        Consonants
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Exploration of consonants
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li> */}
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/replays/consonants"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        Consonant Call Replays
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Selected call recordings from our Fundamentals trainings
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Flow</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2">
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/replays/flow"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        Flow Call Replays
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Selected call recordings from our Fundamentals trainings
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Meta</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2">
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/replays/meta"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        Meta Call Replays
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Selected call recordings from our Fundamentals trainings
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2">
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/phonemes"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        Phonemes
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Interactive guide to English vowels and consonants
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/stats"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        Group Accent Stats
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Aggregated accent data for many Brazilian clients
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>

                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/wls"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        Word Lists & Spelling
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Browse phonetic spellings and word examples
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link
              to="/links"
              className={cn(navigationMenuTriggerStyle(), "cursor-pointer")}
            >
              Links
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex items-center gap-4">
        {showSidebarTrigger && <SidebarTrigger />}
        <ModeToggle />
        <button
          onClick={logout}
          className={cn(navigationMenuTriggerStyle(), "cursor-pointer")}
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
