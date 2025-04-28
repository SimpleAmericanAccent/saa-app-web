import { Link } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "../stores/authStore";
import { ModeToggle } from "./mode-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import useVersionStore from "@/stores/versionStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";

function NavBar({ showSidebarTrigger = false }) {
  const { userRole, isLoading, fetchUserRole, logout } = useAuthStore();
  const { version, setVersion } = useVersionStore();

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  if (isLoading) {
    return (
      <div className="min-h-[var(--navbar-height)] max-h-[var(--navbar-height)] sticky bg-background top-0 border-b z-50 px-4 flex items-center justify-between">
        Loading...
      </div>
    );
  }

  return (
    <nav className="min-h-[var(--navbar-height)] max-h-[var(--navbar-height)] sticky bg-background top-0 border-b z-50 px-4 flex items-center justify-between">
      <NavigationMenu viewport={true}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link
              to="/transcript"
              className={cn(navigationMenuTriggerStyle(), "cursor-pointer")}
            >
              Transcript Viewer
            </Link>
          </NavigationMenuItem>

          {/* New Onboarding Dropdown */}
          <NavigationMenuItem>
            <NavigationMenuTrigger>Onboarding</NavigationMenuTrigger>
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
                {/* More onboarding topics can be added here later */}
                <li className="row-span-3 rounded-md border p-4">
                  <div className="mb-2 mt-4 text-sm font-medium">
                    Getting Started
                  </div>
                  <p className="text-sm text-muted-foreground">
                    These lessons will help you understand the fundamentals of
                    English pronunciation. Start with Lexical Sets and progress
                    through new topics as they become available.
                  </p>
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
                      to="/links"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        Links
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Selected call recordings and training materials
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
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
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {userRole === "write" && (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-3 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/wls-data"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            WLS Data Explorer
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/dictionary-admin"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            Dictionary Admin
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex items-center gap-4">
        {showSidebarTrigger && <SidebarTrigger />}
        {userRole === "write" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(navigationMenuTriggerStyle(), "gap-2")}>
                Version {version.toUpperCase()}
                <span className="text-xs text-muted-foreground">
                  {version === "v1" ? "(Current)" : "(Beta)"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setVersion("v1")}
                  className="flex items-center gap-2"
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border",
                      version === "v1"
                        ? "bg-primary border-primary"
                        : "border-muted"
                    )}
                  >
                    {version === "v1" && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  Version 1 (Current)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setVersion("v2")}
                  className="flex items-center gap-2"
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border",
                      version === "v2"
                        ? "bg-primary border-primary"
                        : "border-muted"
                    )}
                  >
                    {version === "v2" && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  Version 2 (Beta)
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
