import { getSession, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import EmployeeCard from "./EmployeeCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Profile = ({ session }) => {
  const { data, status } = useSession();
  const router = useRouter();
  const [userDetails, setUserDetails] = useState(session?.user || {});

  // ✅ Fetch complete user details from the database
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch("/api/user/details");
        const result = await response.json();
        console.log("🔍 API Response:", result); // Debugging output
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
  }, [data]);

  // ✅ Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session?.user) return <p>You are not logged in.</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      {/* ✅ Display user details inside EmployeeCard */}
      <EmployeeCard employee={userDetails} />
    </div>
  );
};

// ✅ Fetch session server-side
export async function getServerSideProps(context) {
  const session = await getSession(context);
  return {
    props: { session },
  };
}

export default dynamic(() => Promise.resolve(Profile), { ssr: false });
