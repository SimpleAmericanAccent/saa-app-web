import * as React from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  LogOut,
  FileText,
  Volume2,
  Play,
  Settings,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "core-frontend-web/src/components/ui/collapsible";
import { ModeToggle } from "./mode-toggle";
import useAuthStore from "core-frontend-web/src/stores/authStore";

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
  const { logout } = useAuthStore();
  const { state, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [openSubmenus, setOpenSubmenus] = React.useState(new Set());
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Debug current state
  console.log("Current openSubmenus:", [...openSubmenus]);

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
    console.log("Loading saved submenus:", savedSubmenus);
    if (savedSubmenus) {
      try {
        const submenuArray = JSON.parse(savedSubmenus);
        console.log("Parsed submenu array:", submenuArray);
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
      console.log("Saving submenu states:", [...openSubmenus]);
      localStorage.setItem(
        "sidebar-submenus",
        JSON.stringify([...openSubmenus])
      );
    }
  }, [openSubmenus, isInitialized]);

  // Handle submenu toggle
  const handleSubmenuToggle = (submenuId, isOpen) => {
    console.log("Submenu toggle:", submenuId, isOpen);
    setOpenSubmenus((prev) => {
      const newSet = new Set(prev);
      if (isOpen) {
        newSet.add(submenuId);
      } else {
        newSet.delete(submenuId);
      }
      console.log("New submenu set:", [...newSet]);
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
          <SidebarTrigger className="h-8 w-full cursor-pointer" />
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
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <SidebarLink to="/onboarding/lexical-sets-quiz">
                            <Target className="h-4 w-4" />
                            {!isCollapsed && <span>Lexical Sets Quiz</span>}
                          </SidebarLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
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
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <SidebarLink to="/vsounds">
                            <Volume2 className="h-4 w-4" />
                            {!isCollapsed && <span>Vowel Sounds</span>}
                          </SidebarLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
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
              {/* Other Resources */}
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
                            {!isCollapsed && <span>Word Lists & Spelling</span>}
                          </SidebarLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Transcript Viewer */}
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
                    {!isCollapsed && <span>Quiz</span>}
                  </SidebarLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-1">
          <div className="flex items-center justify-between">
            <ModeToggle />
            {!isCollapsed && (
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="">Log Out</span>
              </button>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
    </aside>
  );
}
