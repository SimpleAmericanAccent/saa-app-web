import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Mic,
  MonitorPlay,
  Info,
  MessageSquare,
  Search,
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
import useAuthStore from "core-frontend-web/src/stores/auth-store";
import { useIsMobile } from "core-frontend-web/src/hooks/use-mobile";
import { User, LogOut, Settings } from "lucide-react";
import { useQuizStatsStore } from "../stores/quiz-stats-store";
import { fetchQuizResults, getAllQuizMetadata } from "../utils/quiz-api";

import {
  getTextColorClass,
  getGradientColorStyle,
} from "../utils/performance-colors";

// Quiz statistics component for sidebar
function QuizStats() {
  const [stats, setStats] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const [previousResults, quizDataFromApi] = await Promise.all([
          fetchQuizResults(),
          getAllQuizMetadata(),
        ]);

        // Count quizzes with at least 30 trials for each category
        const getQuizzesWithMinTrials = (category) => {
          if (!previousResults || !quizDataFromApi)
            return { completed: 0, total: 0 };

          const categoryQuizzes = Object.values(quizDataFromApi).filter(
            (quizData) => quizData.category === category
          );

          const quizzesWithMinTrials = categoryQuizzes.filter((quizData) => {
            const result = previousResults[quizData.id];
            return (
              result && (result.recentTotalTrials || result.totalTrials) >= 30
            );
          });

          return {
            completed: quizzesWithMinTrials.length,
            total: categoryQuizzes.length,
          };
        };

        const vowelsWithMinTrials = getQuizzesWithMinTrials("vowels");
        const consonantsWithMinTrials = getQuizzesWithMinTrials("consonants");

        // Calculate overall stats using the same logic as Quiz.jsx
        const totalCompleted =
          vowelsWithMinTrials.completed + consonantsWithMinTrials.completed;
        const totalQuizzes =
          vowelsWithMinTrials.total + consonantsWithMinTrials.total;

        // Calculate average from quizStatsStore for consistency
        const { stats: quizStats } = useQuizStatsStore.getState();
        const overallAverage = quizStats?.overall?.average;

        setStats({
          completed: totalCompleted,
          total: totalQuizzes,
          average: overallAverage,
          totalTrials: quizStats?.overall?.totalTrials || 0,
          correctTrials: quizStats?.overall?.correctTrials || 0,
        });
      } catch (error) {
        console.error("Error loading quiz stats for sidebar:", error);
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
    <div className="flex items-center gap-0 text-xs text-muted-foreground m-auto whitespace-nowrap">
      <span>
        {stats.completed}/{stats.total} quizzes
      </span>
      {stats.average && (
        <span
          className="font-medium"
          style={getGradientColorStyle(stats.average)}
        >
          &nbsp;@&nbsp;{stats.average}%
        </span>
      )}
      {stats.totalTrials > 0 && (
        <span className="text-muted-foreground">
          &nbsp;({stats.correctTrials}/{stats.totalTrials})
        </span>
      )}
    </div>
  );
}

// Custom Link component that closes mobile sidebar on click
function SidebarLink({ to, children, ...props }) {
  const { setOpenMobile, isMobile } = useSidebar();

  const handleClick = (e) => {
    // Don't handle mobile close here if we're inside a SidebarMenuButtonWithClose
    // The button will handle it instead
    if (isMobile && !e.currentTarget.closest('[data-sidebar="menu-button"]')) {
      setOpenMobile(false);
    }
  };

  return (
    <Link to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}

// Custom SidebarMenuButton that closes mobile sidebar on click
function SidebarMenuButtonWithClose({ children, asChild, ...props }) {
  const { setOpenMobile, isMobile } = useSidebar();
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (isMobile) {
      let href = null;

      if (asChild) {
        // When asChild is used, the child (SidebarLink) is the actual clickable element
        // Check if the clicked element itself is a link
        if (
          e.currentTarget.tagName === "A" &&
          e.currentTarget.getAttribute("href")
        ) {
          href = e.currentTarget.getAttribute("href");
        }
      } else {
        // When not asChild, look for a link within the button
        const link = e.currentTarget.querySelector("a[href]");
        if (link) {
          href = link.getAttribute("href");
        }
      }

      if (href) {
        // Close sidebar and navigate
        setOpenMobile(false);
        e.preventDefault();
        e.stopPropagation();
        navigate(href);
        return;
      }
    }
  };

  return (
    <SidebarMenuButton
      asChild={asChild}
      onClick={handleClick}
      className="w-full cursor-pointer"
      {...props}
    >
      {children}
    </SidebarMenuButton>
  );
}

export function SidebarLeft() {
  const { logout, user, fetchUserProfile, isAdmin, canViewReplays, isLoading } =
    useAuthStore();
  const { state, setOpen, openMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [openSubmenus, setOpenSubmenus] = React.useState(new Set());
  const [isInitialized, setIsInitialized] = React.useState(false);
  const isMobile = useIsMobile();

  // On mobile, show text when sidebar is open; on desktop, show text when not collapsed
  const shouldShowText = isMobile ? openMobile : !isCollapsed;

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
              {/* Replays */}
              <SidebarMenuItem>
                <SidebarMenuButtonWithClose asChild tooltip="Replays">
                  <SidebarLink
                    to="/replays"
                    className="flex items-center gap-2"
                  >
                    <MonitorPlay className="h-4 w-4 text-white" />
                    {shouldShowText && (
                      <span className="text-white">Replays</span>
                    )}
                  </SidebarLink>
                </SidebarMenuButtonWithClose>
              </SidebarMenuItem>

              {/* Accent Explorer */}
              <SidebarMenuItem>
                <SidebarMenuButtonWithClose asChild tooltip="Accent Explorer">
                  <SidebarLink
                    to="/accent-explorer"
                    className="flex items-center gap-2"
                  >
                    <Search className="h-4 w-4 text-white" />
                    {shouldShowText && (
                      <span className="text-white">Accent Explorer</span>
                    )}
                  </SidebarLink>
                </SidebarMenuButtonWithClose>
              </SidebarMenuItem>

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
                      {shouldShowText && <span>Vowels</span>}
                      {shouldShowText && (
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuButtonWithClose asChild>
                          <SidebarLink to="/lexical-sets">
                            <Brain className="h-4 w-4" />
                            {shouldShowText && <span>Lexical Sets</span>}
                          </SidebarLink>
                        </SidebarMenuButtonWithClose>
                      </SidebarMenuSubItem>

                      {!isMobile && (
                        <SidebarMenuSubItem>
                          <SidebarMenuButtonWithClose asChild>
                            <SidebarLink to="/spelling-pronunciation">
                              <Settings className="h-4 w-4" />
                              {shouldShowText && (
                                <span>Spelling-Pronunciation Network</span>
                              )}
                            </SidebarLink>
                          </SidebarMenuButtonWithClose>
                        </SidebarMenuSubItem>
                      )}

                      <SidebarMenuSubItem>
                        <SidebarMenuButtonWithClose asChild>
                          <SidebarLink to="/vsynth">
                            <Play className="h-4 w-4" />
                            {shouldShowText && <span>Vowel Synthesizer</span>}
                          </SidebarLink>
                        </SidebarMenuButtonWithClose>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Consonants */}
              {/* <Collapsible
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
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible> */}

              {/* Flow */}
              {/* <Collapsible
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
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible> */}

              {/* Smart Practice */}
              {/* <Collapsible
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
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible> */}
            </SidebarMenu>
          </SidebarGroup>

          {/* Resources Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
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
                ></Collapsible>
              )}

              {/* Transcript Viewer - Hidden on Mobile */}
              {!isMobile && (
                <SidebarMenuItem>
                  <SidebarMenuButtonWithClose asChild tooltip="Accent Analysis">
                    <SidebarLink
                      to="/transcript"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {shouldShowText && <span>Accent Analysis</span>}
                    </SidebarLink>
                  </SidebarMenuButtonWithClose>
                </SidebarMenuItem>
              )}

              {/* Quiz */}
              <SidebarMenuItem>
                <SidebarMenuButtonWithClose asChild tooltip="Quiz">
                  <SidebarLink to="/quiz" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    {shouldShowText && (
                      <div className="flex items-center gap-2 flex-1">
                        <span>Quiz</span>
                        <QuizStats />
                      </div>
                    )}
                  </SidebarLink>
                </SidebarMenuButtonWithClose>
              </SidebarMenuItem>

              {/* Imitation Practice */}
              <SidebarMenuItem>
                <SidebarMenuButtonWithClose asChild tooltip="Imitate">
                  <SidebarLink
                    to="/imitate"
                    className="flex items-center gap-2"
                  >
                    <Mic className="h-4 w-4" />
                    {shouldShowText && <span>Imitate</span>}
                  </SidebarLink>
                </SidebarMenuButtonWithClose>
              </SidebarMenuItem>

              {/* Quiz Audio Admin - Only show for admins */}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButtonWithClose
                    asChild
                    tooltip="Quiz Audio Admin"
                  >
                    <SidebarLink
                      to="/quiz-audio-admin"
                      className="flex items-center gap-2"
                    >
                      <Volume2 className="h-4 w-4" />
                      {shouldShowText && <span>Audio Admin</span>}
                    </SidebarLink>
                  </SidebarMenuButtonWithClose>
                </SidebarMenuItem>
              )}

              {/* Resources */}
              <SidebarMenuItem>
                <SidebarMenuButtonWithClose
                  asChild
                  tooltip="External Resources"
                >
                  <SidebarLink
                    to="/resources"
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    {shouldShowText && <span>External Resources</span>}
                  </SidebarLink>
                </SidebarMenuButtonWithClose>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Program Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Program</SidebarGroupLabel>
            <SidebarMenu>
              {/* Program Details - Links to mgr if has replay access, mg if not */}

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Program Details">
                  <a
                    href={
                      isLoading || !canViewReplays
                        ? "https://simpleamericanaccent.com/mg?utm_source=saa_web_app&utm_medium=web_app&utm_campaign=sidebar"
                        : "https://simpleamericanaccent.com/mgr?utm_source=saa_web_app&utm_medium=web_app&utm_campaign=sidebar"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Info className="h-4 w-4" />
                    {shouldShowText && <span>Program Details</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Message Will */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Message Will">
                  <a
                    href="https://wa.me/13194576479"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {shouldShowText && <span>Message Will</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-1">
          <div className="flex items-center gap-2">
            <ModeToggle />
            {shouldShowText && (
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
