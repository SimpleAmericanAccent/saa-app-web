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

function NavBar({ showSidebarTrigger = false }) {
  const { userRole, isLoading, fetchUserRole } = useAuthStore();

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
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link
              to="/transcript"
              className={cn(navigationMenuTriggerStyle(), "cursor-pointer")}
            >
              Transcript Viewer
            </Link>
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
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link
              to="/stats"
              className={cn(navigationMenuTriggerStyle(), "cursor-pointer")}
            >
              Stats
            </Link>
          </NavigationMenuItem>

          {userRole === "write" && (
            <NavigationMenuItem>
              <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-3 p-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/Home4"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        TV2
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/path"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        Path
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/quiz"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        Quiz
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )}

          <NavigationMenuItem>
            <Link
              to="/logout"
              className={cn(navigationMenuTriggerStyle(), "cursor-pointer")}
            >
              Log Out
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex items-center gap-4">
        {showSidebarTrigger && <SidebarTrigger />}
        <ModeToggle />
      </div>
    </nav>
  );
}

export default NavBar;
