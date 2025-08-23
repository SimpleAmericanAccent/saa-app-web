import * as React from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  FileText,
  Volume2,
  Play,
  BookOpen,
  BarChart3,
  List,
  Link as LinkIcon,
  Brain,
  Target,
  Library,
  HelpCircle,
  Waves,
  Music,
  Construction,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "core-frontend-web/src/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "core-frontend-web/src/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "core-frontend-web/src/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "core-frontend-web/src/components/ui/dropdown-menu";
import { ModeToggle } from "./mode-toggle";
import useAuthStore from "core-frontend-web/src/stores/authStore";
import { useIsMobile } from "core-frontend-web/src/hooks/use-mobile";
import { User, LogOut, Settings } from "lucide-react";
import { getQuizStats } from "../utils/quizStats";

import {
  getTextColorClass,
  getGradientColorStyle,
} from "../utils/performanceColors";

// Quiz statistics component for sidebar
function QuizStats() {
  const [stats, setStats] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const quizStats = await getQuizStats();
        setStats(quizStats);
      } catch (error) {
        console.error("Error loading quiz stats:", error);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading || !stats) {
    return null;
  }

  return (
    <div className="flex items-center gap-0 text-xs text-muted-foreground m-auto">
      <span>
        {stats.overall.completed}/{stats.overall.total}
      </span>
      {stats.overall.average && (
        <span
          className="font-medium"
          style={getGradientColorStyle(stats.overall.average)}
        >
          &nbsp;@&nbsp;{stats.overall.average}% Avg
        </span>
      )}
    </div>
  );
}

// Custom Link component that closes mobile sidebar on click
function SidebarLink({ to, children, ...props }) {
  const { setOpenMobile, isMobile } = useSidebar();

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Link to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}

export function SidebarLeft() {
  const { logout, user, fetchUserProfile, isAdmin } = useAuthStore();
  const { state, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [openSubmenus, setOpenSubmenus] = React.useState(new Set());
  const [isInitialized, setIsInitialized] = React.useState(false);
  const isMobile = useIsMobile();

  // Fetch user profile if not already loaded
  React.useEffect(() => {
    if (!user) {
      fetchUserProfile();
    }
  }, [user, fetchUserProfile]);

  // Persist sidebar state in localStorage
  React.useEffect(() => {
    const savedState = localStorage.getItem("sidebar-state");
    if (savedState && savedState !== state) {
      setOpen(savedState === "open");
    }
  }, []); // Only run on mount

  // Save sidebar state to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem("sidebar-state", state);
  }, [state]);

  // Load submenu states from localStorage on mount
  React.useEffect(() => {
    const savedSubmenus = localStorage.getItem("sidebar-submenus");
    if (savedSubmenus) {
      try {
        const submenuArray = JSON.parse(savedSubmenus);
        setOpenSubmenus(new Set(submenuArray));
      } catch (error) {
        console.warn("Failed to parse saved submenu states:", error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save submenu states to localStorage when they change (but not on initial load)
  React.useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(
        "sidebar-submenus",
        JSON.stringify([...openSubmenus])
      );
    }
  }, [openSubmenus, isInitialized]);

  // Handle submenu toggle
  const handleSubmenuToggle = (submenuId, isOpen) => {
    setOpenSubmenus((prev) => {
      const newSet = new Set(prev);
      if (isOpen) {
        newSet.add(submenuId);
      } else {
        newSet.delete(submenuId);
      }
      return newSet;
    });
  };

  // Handle collapsed state interactions
  const handleCollapsedIconClick = (
    e,
    hasSubmenu = false,
    submenuId = null
  ) => {
    if (isCollapsed && hasSubmenu) {
      // Prevent the default collapsible behavior
      e.preventDefault();
      e.stopPropagation();

      setOpen(true);
      // Open the submenu when expanding from collapsed state
      if (submenuId) {
        setOpenSubmenus((prev) => new Set([...prev, submenuId]));
      }
    }
  };

  return (
    <aside>
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader className="h-8 border-b border-sidebar-border flex items-center justify-end p-0">
          {!isMobile ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="h-8 w-full cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
          ) : (
            <SidebarTrigger className="h-8 w-full cursor-pointer" />
          )}
        </SidebarHeader>

        <SidebarContent>
          {/* Fundamentals Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Fundamentals</SidebarGroupLabel>
            <SidebarMenu>
              {/* Vowels */}
              <Collapsible
                asChild
                className="group/collapsible"
                open={openSubmenus.has("vowels")}
                onOpenChange={(isOpen) => handleSubmenuToggle("vowels", isOpen)}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Vowels"
                      className="cursor-pointer"
                      onClick={(e) =>
                        handleCollapsedIconClick(e, true, "vowels")
                      }
                    >
                      <Waves className="h-4 w-4" />
                      {!isCollapsed && <span>Vowels</span>}
                      {!isCollapsed && (
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <SidebarLink to="/onboarding/lexical-sets">
                            <Brain className="h-4 w-4" />
                            {!isCollapsed && <span>Lexical Sets</span>}
                          </SidebarLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {!isMobile && (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <SidebarLink to="/spelling-pronunciation">
                              <Settings className="h-4 w-4" />
                              {!isCollapsed && (
                                <span>Spelling-Pronunciation Network</span>
                              )}
                            </SidebarLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}

                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <SidebarLink to="/vsynth">
                            <Play className="h-4 w-4" />
                            {!isCollapsed && <span>Vowel Synthesizer</span>}
                          </SidebarLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <SidebarLink to="/replays/vowels">
                            <List className="h-4 w-4" />
                            {!isCollapsed && <span>Vowel Call Replays</span>}
                          </SidebarLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Consonants */}
              <Collapsible
                asChild
                className="group/collapsible"
                open={openSubmenus.has("consonants")}
                onOpenChange={(isOpen) =>
                  handleSubmenuToggle("consonants", isOpen)
                }
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Consonants"
                      className="cursor-pointer"
                      onClick={(e) =>
                        handleCollapsedIconClick(e, true, "consonants")
                      }
                    >
                      <Construction className="h-4 w-4" />
                      {!isCollapsed && <span>Consonants</span>}
                      {!isCollapsed && (
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <SidebarLink to="/replays/consonants">
                            <List className="h-4 w-4" />
                            {!isCollapsed && (
                              <span>Consonant Call Replays</span>
                            )}
                          </SidebarLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Flow */}
              <Collapsible
                asChild
                className="group/collapsible"
                open={openSubmenus.has("flow")}
                onOpenChange={(isOpen) => handleSubmenuToggle("flow", isOpen)}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Flow"
                      className="cursor-pointer"
                      onClick={(e) => handleCollapsedIconClick(e, true, "flow")}
                    >
                      <Music className="h-4 w-4" />
                      {!isCollapsed && <span>Flow</span>}
                      {!isCollapsed && (
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <SidebarLink to="/replays/flow">
                            <List className="h-4 w-4" />
                            {!isCollapsed && <span>Flow Call Replays</span>}
                          </SidebarLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Smart Practice */}
              <Collapsible
                asChild
                className="group/collapsible"
                open={openSubmenus.has("smart-practice")}
                onOpenChange={(isOpen) =>
                  handleSubmenuToggle("smart-practice", isOpen)
                }
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Smart Practice"
                      className="cursor-pointer"
                      onClick={(e) =>
                        handleCollapsedIconClick(e, true, "smart-practice")
                      }
                    >
                      <Brain className="h-4 w-4" />
                      {!isCollapsed && <span>Smart Practice</span>}
                      {!isCollapsed && (
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <SidebarLink to="/replays/smart-practice">
                            <List className="h-4 w-4" />
                            {!isCollapsed && (
                              <span>Smart Practice Call Replays</span>
                            )}
                          </SidebarLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>

          {/* Resources Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Other</SidebarGroupLabel>
            <SidebarMenu>
              {/* Other Resources - Hidden on Mobile */}
              {!isMobile && (
                <Collapsible
                  asChild
                  className="group/collapsible"
                  open={openSubmenus.has("more-resources")}
                  onOpenChange={(isOpen) =>
                    handleSubmenuToggle("more-resources", isOpen)
                  }
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip="More Resources"
                        className="cursor-pointer"
                        onClick={(e) =>
                          handleCollapsedIconClick(e, true, "more-resources")
                        }
                      >
                        <Library className="h-4 w-4" />
                        {!isCollapsed && <span>More Resources</span>}
                        {!isCollapsed && (
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <SidebarLink to="/phonemes">
                              <BookOpen className="h-4 w-4" />
                              {!isCollapsed && <span>Phonemes</span>}
                            </SidebarLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <SidebarLink to="/stats">
                              <BarChart3 className="h-4 w-4" />
                              {!isCollapsed && <span>Group Accent Stats</span>}
                            </SidebarLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <SidebarLink to="/wls">
                              <List className="h-4 w-4" />
                              {!isCollapsed && (
                                <span>Word Lists & Spelling</span>
                              )}
                            </SidebarLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* Transcript Viewer - Hidden on Mobile */}
              {!isMobile && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Transcript Viewer">
                    <SidebarLink
                      to="/transcript"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {!isCollapsed && <span>Transcript Viewer</span>}
                    </SidebarLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Links */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Links">
                  <SidebarLink to="/links" className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    {!isCollapsed && <span>Links</span>}
                  </SidebarLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Quiz */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Quiz">
                  <SidebarLink to="/quiz" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    {!isCollapsed && (
                      <div className="flex items-center gap-2 flex-1">
                        <span>Quiz</span>
                        <QuizStats />
                      </div>
                    )}
                  </SidebarLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Quiz Audio Admin - Only show for admins */}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Quiz Audio Admin">
                    <SidebarLink
                      to="/quiz-audio-admin"
                      className="flex items-center gap-2"
                    >
                      <Volume2 className="h-4 w-4" />
                      {!isCollapsed && <span>Audio Admin</span>}
                    </SidebarLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-1">
          <div className="flex items-center gap-2">
            <ModeToggle />
            {!isCollapsed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors cursor-pointer flex-1">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name || "User"}
                        className="h-6 w-6 rounded-full flex-shrink-0"
                      />
                    ) : (
                      <User className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {user?.name || user?.email || "User"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col items-center space-y-3">
                      {user?.picture && (
                        <img
                          src={user.picture}
                          alt={user.name || "User"}
                          className="h-12 w-12 rounded-full border-2 border-border"
                        />
                      )}
                      <div className="text-center space-y-1">
                        <p className="text-sm font-semibold leading-none">
                          {user?.name || "User"}
                        </p>
                        {user?.email && (
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="px-4 py-3 justify-center items-center gap-3 hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
    </aside>
  );
}
