import NavBar from "@/components/NavBar.jsx";
import { SidebarRight } from "@/components/sidebar-right";
import { Outlet } from "react-router";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Layout1({ children }) {
  return (
    <div className="w-screen h-screen flex flex-col">
      <NavBar />
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <main className="flex1">
            <Outlet />
          </main>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel></ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
