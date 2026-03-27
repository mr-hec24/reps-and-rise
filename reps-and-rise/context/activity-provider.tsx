import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Activity {
  id: string;
  name: string;
}

interface ActivityContextType {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const ActivityContext = createContext<ActivityContextType>({
  activities: [],
  loading: true,
  error: null,
  refetch: () => {},
});

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('exercises')
        .select('id, name')
        .order('name', { ascending: true });

      if (supabaseError) throw supabaseError;

      // Map columns to standard format
      const mappedActivities = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
      }));

      setActivities(mappedActivities);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch activities';
      setError(message);
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <ActivityContext.Provider
      value={{
        activities,
        loading,
        error,
        refetch: fetchActivities,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivities() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivities must be used within ActivityProvider');
  }
  return context;
}
