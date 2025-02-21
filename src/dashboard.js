import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated (Example: Check localStorage or session)
    const user = localStorage.getItem('user');
    if (!user) router.push('/login');
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p>Manage employees, roles, and more.</p>
    </div>
  );
}
