# Notie

Notie is a kawaii sticky-note app built with React, Vite, React Router, Supabase, Framer Motion, and `html-to-image`.

## Setup

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and fill in your Supabase project values.
3. Create the `notes` table in Supabase using:

```sql
create table notes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  message text not null check (char_length(message) <= 25),
  design_id text not null,
  theme_id text not null,
  stickers text[],
  pos_x float not null,
  pos_y float not null,
  rotation float not null
);
```

4. Enable Realtime for the `notes` table in Supabase.
5. Run the app:
   `npm run dev`

If PowerShell blocks `npm` with an execution policy error, use:
`.\start-local.cmd`

## Notes

- The name field persists in `localStorage`.
- Realtime inserts are deduplicated client-side by note id.
- PNG export uses the same DOM note renderer as the preview and board modal.
- A companion Figma direction file was created here for the refined visual pass:
  `https://www.figma.com/design/JvKRDSk0hABWI1RwzAhkMP`
