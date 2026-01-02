import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
    const perPage = Number(url.searchParams.get('perPage') || '50')

    // Use the Dattebayo API by default; can be overridden with NARUTO_API env var
    const NARUTO_API = process.env.NARUTO_API || 'https://dattebayo-api.onrender.com/characters'

    const res = await fetch(NARUTO_API)
    if (!res.ok) {
      return NextResponse.json({ page, perPage, total: 0, data: [] }, { status: 502 })
    }

    const all = await res.json()
    // Support different response shapes: array, { data: [...] }, or { characters: [...] }
    const items = Array.isArray(all)
      ? all
      : Array.isArray(all?.data)
      ? all.data
      : Array.isArray(all?.characters)
      ? all.characters
      : []

    const total = items.length
    const start = (page - 1) * perPage
    // Build normalized data items so frontend can rely on `image` and `name`
    const data = items.slice(start, start + perPage).map((it: any) => ({
      id: it.id ?? it._id ?? undefined,
      name: it.name ?? it.fullName ?? 'Unknown',
      clan: it.clan ?? undefined,
      image: Array.isArray(it.images) ? it.images[0] : it.image ?? null,
      raw: it,
    }))

    return NextResponse.json({ page, perPage, total, data })
  } catch (err) {
    return NextResponse.json({ error: 'failed to fetch' }, { status: 500 })
  }
}
