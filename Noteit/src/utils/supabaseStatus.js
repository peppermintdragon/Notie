export function getSupabaseIssueMessage(error) {
  if (!error) return '';

  const message = String(error.message || error.details || error.hint || 'Unknown Supabase error');
  const normalized = message.toLowerCase();

  if (normalized.includes('relation') && normalized.includes('notes')) {
    return 'Supabase is connected, but the notes table does not exist yet. Run the SQL setup from the README first.';
  }

  if (normalized.includes('404')) {
    return 'Supabase returned a 404, which usually means public.notes does not exist yet or the API cannot see it.';
  }

  if (normalized.includes('row-level security') || normalized.includes('permission denied')) {
    return 'Supabase permissions are blocking this request. Add anon read and insert policies to the notes table.';
  }

  return message;
}
