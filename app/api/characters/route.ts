import { NextResponse } from 'next/server'

export function normalizeCharacter(it: any) {
  // rank extraction (string or object like { Part I: 'Genin', Part II: 'Kage' })
  const rankField = it.rank ?? it.ninjaRank ?? it.occupation?.ninjaRank
  let rank: string | undefined
  if (typeof rankField === 'string') rank = rankField
  else if (rankField && typeof rankField === 'object') {
    const vals = Object.values(rankField).flatMap((v: any) => (v && typeof v === 'object' ? Object.values(v) : [v])).map(String).map(s => s.trim()).filter(Boolean)
    rank = vals[0]
  }

  // chakra nature (string or array)
  const chakraField = it.chakraNature ?? it.chakra?.nature ?? it.element ?? it.chakraNatureList
  const chakraNature = Array.isArray(chakraField) ? chakraField.join(', ') : typeof chakraField === 'string' ? chakraField : undefined

  // jutsu count
  let jutsuCount = Number(it.jutsuCount ?? it.jutsu_count ?? it.techniqueCount ?? 0) || undefined
  if (!jutsuCount) {
    if (Array.isArray(it.techniques)) jutsuCount = it.techniques.length
    else if (Array.isArray(it.jutsus)) jutsuCount = it.jutsus.length
    else if (Array.isArray(it.jutsu)) jutsuCount = it.jutsu.length
  }

  // occupation normalization (string, remove numeric-only tokens)
  function formatOccupation(occ: any) {
    if (!occ) return undefined
    let values: any[] = []
    if (typeof occ === 'string') values = [occ]
    else if (Array.isArray(occ)) values = occ
    else if (typeof occ === 'object') values = Object.values(occ).flatMap((v: any) => (v && typeof v === 'object' ? Object.values(v) : [v]))
    else values = [String(occ)]

    const tokens = values
      .flatMap((v) => (typeof v === 'string' ? v.split(',') : [String(v)]))
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((t) => !/^[\d-]+$/.test(t))

    const out = Array.from(new Set(tokens)).join(', ')
    return out || undefined
  }

  const occupationNormalized = formatOccupation(it.occupation ?? it.rank ?? it.role)

  // clan normalization (string, array, or object)
  function formatClan(cl: any) {
    if (!cl) return undefined
    if (typeof cl === 'string') return cl
    if (Array.isArray(cl)) {
      const tokens = cl.flatMap((v) => (typeof v === 'string' ? v.split(',') : [String(v)])).map((s) => s.trim()).filter(Boolean)
      return tokens[0]
    }
    if (typeof cl === 'object') {
      // look for common keys
      const candidates = ['clan', 'name', 'family', 'clanName', 'bloodline']
      for (const key of candidates) {
        const v = cl[key]
        if (v && (typeof v === 'string' || typeof v === 'number')) return String(v)
        if (Array.isArray(v) && v.length) return String(v[0])
      }
      // fall back to first string value in the object
      const vals = Object.values(cl).flatMap((v: any) => (Array.isArray(v) ? v : [v])).map(String).map(s => s.trim()).filter(Boolean)
      return vals[0]
    }
    return String(cl)
  }

  const clanNormalized = formatClan(it.clan ?? it.family ?? it.clanName ?? it.bloodline)

  return {
    id: it.id ?? it._id ?? undefined,
    name: it.name ?? it.fullName ?? it.title ?? 'Unknown',
    clan: clanNormalized,
    village: it.village ?? it.origin ?? it.villageOf ?? undefined,
    occupation: occupationNormalized,
    rank,
    chakraNature,
    jutsuCount,
    image: Array.isArray(it.images) ? it.images[0] : it.image ?? null,
    raw: it,
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
    const perPage = Number(url.searchParams.get('perPage') || '50')

    // Use the Dattebayo API by default; can be overridden with NARUTO_API env var
    const NARUTO_API = process.env.NARUTO_API || 'https://dattebayo-api.onrender.com/characters'

    // Try paginated fetch from Dattebayo
    const fetchUrl = `${NARUTO_API}?page=${page}&limit=${perPage}`
    try {
      const res = await fetch(fetchUrl)
      if (!res.ok) throw new Error(`status:${res.status}`)
      const json = await res.json()
      const items = Array.isArray(json?.characters) ? json.characters : Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
      const total = Number(json?.meta?.total) || Number(json?.meta?.count) || items.length

      const data = items.map(normalizeCharacter)

      return NextResponse.json({ page, perPage, total, data, source: fetchUrl })
    } catch (e) {
      // Fallback: try the older all-characters endpoint and slice locally
      const FALLBACK = process.env.NARUTO_FALLBACK || 'https://naruto-api.fly.dev/characters'
      try {
        const fres = await fetch(FALLBACK)
        if (!fres.ok) throw new Error(`fallback status:${fres.status}`)
        const all = await fres.json()
        const items = Array.isArray(all) ? all : Array.isArray(all?.data) ? all.data : []
        const total = items.length
        const start = (page - 1) * perPage
        const data = items.slice(start, start + perPage).map(normalizeCharacter)
        return NextResponse.json({ page, perPage, total, data, source: FALLBACK })
      } catch (err) {
        return NextResponse.json({ page, perPage, total: 0, data: [], error: String(err) }, { status: 502 })
      }
    }
  } catch (err) {
    return NextResponse.json({ error: 'failed to fetch' }, { status: 500 })
  }
}
