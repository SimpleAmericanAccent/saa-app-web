import * as React from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  LogOut,
  FileText,
  Mic,
  Volume2,
  Play,
  Settings,
  BookOpen,
  BarChart3,
  List,
  Link as LinkIcon,
  GraduationCap,
  Brain,
  Zap,
  Target,
  Library,
  HelpCircle,
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

export function SidebarLeft() {
  const { logout } = useAuthStore();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

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
              <Collapsible asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Vowels"
                      className="cursor-pointer"
                    >
                      <Mic className="h-4 w-4" />
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
                          <Link to="/onboarding/lexical-sets">
                            <Brain className="h-4 w-4" />
                            {!isCollapsed && <span>Lexical Sets</span>}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link to="/onboarding/lexical-sets-quiz">
                            <Target className="h-4 w-4" />
                            {!isCollapsed && <span>Lexical Sets Quiz</span>}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link to="/spelling-pronunciation">
                            <Settings className="h-4 w-4" />
                            {!isCollapsed && (
                              <span>Spelling-Pronunciation Network</span>
                            )}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link to="/vsounds">
                            <Volume2 className="h-4 w-4" />
                            {!isCollapsed && <span>Vowel Sounds</span>}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link to="/vsynth">
                            <Play className="h-4 w-4" />
                            {!isCollapsed && <span>Vowel Synthesizer</span>}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link to="/replays/vowels">
                            <List className="h-4 w-4" />
                            {!isCollapsed && <span>Vowel Call Replays</span>}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Consonants */}
              <Collapsible asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Consonants"
                      className="cursor-pointer"
                    >
                      <Mic className="h-4 w-4" />
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
                          <Link to="/replays/consonants">
                            <List className="h-4 w-4" />
                            {!isCollapsed && (
                              <span>Consonant Call Replays</span>
                            )}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Flow */}
              <Collapsible asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Flow"
                      className="cursor-pointer"
                    >
                      <Zap className="h-4 w-4" />
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
                          <Link to="/replays/flow">
                            <List className="h-4 w-4" />
                            {!isCollapsed && <span>Flow Call Replays</span>}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Smart Practice */}
              <Collapsible asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Smart Practice"
                      className="cursor-pointer"
                    >
                      <Target className="h-4 w-4" />
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
                          <Link to="/replays/smart-practice">
                            <List className="h-4 w-4" />
                            {!isCollapsed && (
                              <span>Smart Practice Call Replays</span>
                            )}
                          </Link>
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
              {/* Transcript Viewer */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/transcript" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {!isCollapsed && <span>Transcript Viewer</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Links */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/links" className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    {!isCollapsed && <span>Links</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Quiz */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/quiz" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    {!isCollapsed && <span>Quiz</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Other Resources */}
              <Collapsible asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="More Resources"
                      className="cursor-pointer"
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
                          <Link to="/phonemes">
                            <BookOpen className="h-4 w-4" />
                            {!isCollapsed && <span>Phonemes</span>}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link to="/stats">
                            <BarChart3 className="h-4 w-4" />
                            {!isCollapsed && <span>Group Accent Stats</span>}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link to="/wls">
                            <List className="h-4 w-4" />
                            {!isCollapsed && <span>Word Lists & Spelling</span>}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
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
