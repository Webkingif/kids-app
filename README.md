# Kids Naruto App (Demo)

This is a minimal Next.js + TypeScript demo showing a Characters page that fetches Naruto characters from a public Naruto API and displays 50 characters per page.

Local development

1. Install dependencies:

   npm install

2. Run dev server:

   npm run dev

API and configuration

- The API route at `/api/characters` proxies an external Naruto API and slices results to 50 per page.
- By default this demo uses `https://dattebayo-api.onrender.com/characters`. You can set a custom API endpoint by creating a `.env.local` with `NARUTO_API` pointing to an array-based characters endpoint.

Notes

- This repo is a demo. Use original/inspired character art and respect copyright when using official IP.
