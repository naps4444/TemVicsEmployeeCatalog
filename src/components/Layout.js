import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import useEmployeeStore from "@/store/employeeStore"; // Zustand store
import Navbar from "./Navbar";

export default function Layout({ children }) {
  const { data: session, status } = useSession();
  const setUser = useEmployeeStore((state) => state.setUser); // Get setUser from Zustand store
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser({ name: session.user.name, image: session.user.image }); // Update user using Zustand
    } else if (status === "unauthenticated") {
      setUser(null); // Clear user from Zustand store
    }
  }, [session, status, setUser]);

  // Hide Navbar on login and signup pages
  const hideNavbar = ["/login", "/signup"].includes(router.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-grow p-4">{children}</main>
    </div>
  );
}
