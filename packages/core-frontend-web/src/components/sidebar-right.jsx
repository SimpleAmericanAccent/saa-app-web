import * as React from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "core-frontend-web/src/components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";

export function SidebarRight() {
  return (
    <aside className="z-9999999  top-0 right-0 h-svh border-l flex">
      <Sidebar
        side="right"
        collapsible="none"
        className="z-9999999 h-svh border-l flex"
      >
        <SidebarHeader className="h-8 border-b border-sidebar-border flex items-center justify-end p-0">
          "hi"
        </SidebarHeader>

        <SidebarContent>"hello world"</SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-1">
          <div className="flex items-center gap-2">"hi"</div>
        </SidebarFooter>
      </Sidebar>
    </aside>
  );
}
