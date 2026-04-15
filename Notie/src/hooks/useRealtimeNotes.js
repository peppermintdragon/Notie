import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useRealtimeNotes(onInsert) {
  useEffect(() => {
    if (!supabase) return undefined;

    const channel = supabase
      .channel('notes-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notes' },
        (payload) => onInsert(payload.new)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onInsert]);
}
