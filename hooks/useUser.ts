'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useSupabase } from '@/context/SupabaseContext';

interface UserData {
  email: string;
  full_name: string;
  clerk_id: string;
}

export function useUser(): {
  user: UserData | null;
  isLoading: boolean;
  isSignedIn: boolean;
} {
  const { userId, isLoaded: clerkLoaded } = useAuth();
  const { supabase, isLoading: supabaseLoading } = useSupabase();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!clerkLoaded || supabaseLoading || !userId) {
      if (clerkLoaded && !userId) {
        setIsLoading(false);
      }
      return;
    }

    const fetchUser = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', userId)
          .single();

        if (error) {
          console.error('Error fetching user:', error);
          return;
        }

        setUser(data as UserData);
      } catch (error) {
        console.error('Error in user fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId, clerkLoaded, supabase, supabaseLoading]);

  return { user, isLoading, isSignedIn: !!userId };
}
