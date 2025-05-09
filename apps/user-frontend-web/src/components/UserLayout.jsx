import NavBar from "core-frontend-web/src/components/NavBar";
import useAuthStore from "core-frontend-web/src/stores/authStore";
import { useEffect } from "react";

export default function UserLayout({ children }) {
  const { isLoggedOut } = useAuthStore();

  useEffect(() => {
    if (isLoggedOut === true) {
      window.location.replace("/logout");
    }
  }, [isLoggedOut]);

  return (
    <div className="w-screen h-screen flex flex-col">
      <NavBar />
      <main className="w-full flex-1">{children}</main>
    </div>
  );
}
