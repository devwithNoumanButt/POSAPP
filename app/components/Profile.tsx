'use client';

import { useUser } from '@/hooks/useUser';

export default function Profile() {
  const { user, isLoading } = useUser(); // ✅ Use 'isLoading' instead of 'loading'

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {user.email}</p>
      <p>Name: {user.full_name}</p>
    </div>
  );
}
