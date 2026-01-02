import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
    const perPage = Number(url.searchParams.get('perPage') || '50')

    // Primary (larger) API and fallback (Dattebayo)
    const PRIMARY_API = process.env.NARUTO_API || 'https://naruto-api.fly.dev/characters'
    const FALLBACK_API = process.env.NARUTO_FALLBACK || 'https://dattebayo-api.onrender.com/characters'

    let source = PRIMARY_API
    let all: any = null

    try {
      const res = await fetch(PRIMARY_API)
      if (!res.ok) throw new Error(`primary status ${res.status}`)
      all = await res.json()
    } catch (e) {
      // Try fallback
      source = FALLBACK_API
      try {
        const fres = await fetch(FALLBACK_API)
        if (!fres.ok) throw new Error(`fallback status ${fres.status}`)
        all = await fres.json()
      } catch (err) {
        // both failed
        return NextResponse.json({ page, perPage, total: 0, data: [], error: String(err), source }, { status: 502 })
      }
    }

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

    return NextResponse.json({ page, perPage, total, data, source })
  } catch (err) {
    return NextResponse.json({ error: 'failed to fetch' }, { status: 500 })
  }
}
