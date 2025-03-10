import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import EmployeeCard from "./EmployeeCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Profile = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userDetails, setUserDetails] = useState(null);

  // ✅ Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // ✅ Redirect to home after login
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/"); // Redirect to home page
    }
  }, [status, router]);

  // ✅ Fetch user details when authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const fetchUserDetails = async () => {
        try {
          const response = await fetch("/api/user/details");
          const result = await response.json();
          console.log("🔍 API Response:", result);
          if (response.ok) {
            setUserDetails(result.user);
          } else {
            console.error("❌ API Error:", result.error);
          }
        } catch (error) {
          console.error("🚨 Fetch error:", error);
        }
      };

      fetchUserDetails();
    }
  }, [status, session]);

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") return <p>You are not logged in.</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {userDetails ? <EmployeeCard employee={userDetails} /> : <p>Loading user details...</p>}
    </div>
  );
};

export default dynamic(() => Promise.resolve(Profile), { ssr: false });
