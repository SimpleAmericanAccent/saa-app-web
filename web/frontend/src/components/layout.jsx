import NavBar from "@/components/navbar/NavBar.jsx";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="">{children}</main>
    </div>
  );
}
