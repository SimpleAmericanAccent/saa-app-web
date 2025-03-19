import { Link } from "react-router";
import { useEffect } from "react";
import useAuthStore from "../../stores/authStore";
import "./navBar.css";
import { ModeToggle } from "../mode-toggle";

function NavBar() {
  const { userRole, isLoading, fetchUserRole } = useAuthStore();

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  if (isLoading) {
    return (
      <div className="sticky top-0 bg-background z-50 p-2">Loading...</div>
    );
  }
  return (
    <div className="sticky top-0 bg-background z-50 p-0 m-0 flex items-center justify-between">
      <div className="flex items-center gap-2 p-0 m-0">
        <a href="/logout">Log Out</a>
        {" | "}
        <Link to="/Home1">Transcript Viewer</Link>
        {" | "}
        <Link to="/Home6">Stats</Link>
        {" | "}
        <Link to="/Home2">Word Lists & Spelling</Link>
        {" | "}
        <Link to="/Home3">Vowel Sounds</Link>
        {" | "}
        <Link to="/Home5">Vowel Synth</Link>
        {/* Show admin features only for users with write access */}
        {userRole === "write" && (
          <>
            {" | "}
            <Link to="/Home4">TV2</Link>
            {" | "}
            <Link to="/path">Path</Link>
            {" | "}
            <Link to="/quiz">Quiz</Link>
          </>
        )}
      </div>
      <ModeToggle />
    </div>
  );
}

export default NavBar;
