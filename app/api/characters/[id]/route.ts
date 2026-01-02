import { NextResponse } from 'next/server'
import { normalizeCharacter } from '../route'

export async function GET(req: Request, { params }: any) {
  const id = params.id
  const NARUTO_API = process.env.NARUTO_API || 'https://dattebayo-api.onrender.com/characters'
  const FALLBACK = process.env.NARUTO_FALLBACK || 'https://naruto-api.fly.dev/characters'

  try {
    // Try fetch by id first
    const res = await fetch(`${NARUTO_API}/${encodeURIComponent(id)}`, { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      const it = Array.isArray(json) ? json[0] : json
      return NextResponse.json({ data: normalizeCharacter(it), source: `${NARUTO_API}/${id}` })
    }
  } catch (e) {
    // ignore and try fallback below
  }

  // Fallback: fetch all and find by id or name
  try {
    const fres = await fetch(FALLBACK, { cache: 'no-store' })
    if (!fres.ok) throw new Error(`fallback status:${fres.status}`)
    const all = await fres.json()
    const items = Array.isArray(all) ? all : Array.isArray(all?.data) ? all.data : []
    const match = items.find((it: any) => String(it.id) === String(id) || String(it._id) === String(id) || String(it.name)?.toLowerCase() === String(id)?.toLowerCase())
    if (match) return NextResponse.json({ data: normalizeCharacter(match), source: FALLBACK })
    return NextResponse.json({ error: 'character not found' }, { status: 404 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}
