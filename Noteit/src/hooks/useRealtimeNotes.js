import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useRealtimeNotes(onChange, enabled = true) {
  useEffect(() => {
    if (!supabase || !enabled) return undefined;

    const channel = supabase
      .channel('notes-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notes' },
        (payload) => onChange(payload.new, 'INSERT')
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notes' },
        (payload) => onChange(payload.new, 'UPDATE')
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, onChange]);
}
