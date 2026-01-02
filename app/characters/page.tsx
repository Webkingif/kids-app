import Link from 'next/link'
import CharacterCard from '../../components/CharacterCard'

async function fetchPage(page: number, perPage: number) {
  const NARUTO_API = process.env.NARUTO_API || 'https://dattebayo-api.onrender.com/characters'
  const fetchUrl = `${NARUTO_API}?page=${page}&limit=${perPage}`
  try {
    const res = await fetch(fetchUrl, { cache: 'no-store' })
    if (!res.ok) throw new Error(`status:${res.status}`)
    const json = await res.json()
    const items = Array.isArray(json?.characters) ? json.characters : Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
    const total = Number(json?.meta?.total) || Number(json?.meta?.count) || items.length

    const data = items.map((it: any) => {
      const rankField = it.rank ?? it.ninjaRank ?? it.occupation?.ninjaRank
      let rank: string | undefined
      if (typeof rankField === 'string') rank = rankField
      else if (rankField && typeof rankField === 'object') {
        const vals = Object.values(rankField).flatMap((v: any) => (v && typeof v === 'object' ? Object.values(v) : [v])).map(String).map(s => s.trim()).filter(Boolean)
        rank = vals[0]
      }

      const chakraField = it.chakraNature ?? it.chakra?.nature ?? it.element ?? it.chakraNatureList
      const chakraNature = Array.isArray(chakraField) ? chakraField.join(', ') : typeof chakraField === 'string' ? chakraField : undefined

      let jutsuCount = Number(it.jutsuCount ?? it.jutsu_count ?? it.techniqueCount ?? 0) || undefined
      if (!jutsuCount) {
        if (Array.isArray(it.techniques)) jutsuCount = it.techniques.length
        else if (Array.isArray(it.jutsus)) jutsuCount = it.jutsus.length
        else if (Array.isArray(it.jutsu)) jutsuCount = it.jutsu.length
      }

      return {
        id: it.id ?? it._id ?? undefined,
        name: it.name ?? it.fullName ?? it.title ?? 'Unknown',
        clan: it.clan ?? undefined,
        village: it.village ?? it.origin ?? it.villageOf ?? undefined,
        occupation: it.occupation ?? it.rank ?? it.role ?? undefined,
        rank,
        chakraNature,
        jutsuCount,
        image: Array.isArray(it.images) ? it.images[0] : it.image ?? null,
        raw: it,
      }
    })

    return { page, perPage, total, data }
  } catch (e) {
    const FALLBACK = process.env.NARUTO_FALLBACK || 'https://naruto-api.fly.dev/characters'
    try {
      const fres = await fetch(FALLBACK, { cache: 'no-store' })
      if (!fres.ok) throw new Error(`fallback status:${fres.status}`)
      const all = await fres.json()
      const items = Array.isArray(all) ? all : Array.isArray(all?.data) ? all.data : []
      const total = items.length
      const start = (page - 1) * perPage
      const data = items.slice(start, start + perPage).map((it: any) => {
        const rankField = it.rank ?? it.ninjaRank ?? it.occupation?.ninjaRank
        let rank: string | undefined
        if (typeof rankField === 'string') rank = rankField
        else if (rankField && typeof rankField === 'object') {
          const vals = Object.values(rankField).flatMap((v: any) => (v && typeof v === 'object' ? Object.values(v) : [v])).map(String).map(s => s.trim()).filter(Boolean)
          rank = vals[0]
        }

        const chakraField = it.chakraNature ?? it.chakra?.nature ?? it.element ?? it.chakraNatureList
        const chakraNature = Array.isArray(chakraField) ? chakraField.join(', ') : typeof chakraField === 'string' ? chakraField : undefined

        let jutsuCount = Number(it.jutsuCount ?? it.jutsu_count ?? it.techniqueCount ?? 0) || undefined
        if (!jutsuCount) {
          if (Array.isArray(it.techniques)) jutsuCount = it.techniques.length
          else if (Array.isArray(it.jutsus)) jutsuCount = it.jutsus.length
          else if (Array.isArray(it.jutsu)) jutsuCount = it.jutsu.length
        }

        return {
          id: it.id ?? it._id ?? undefined,
          name: it.name ?? it.fullName ?? 'Unknown',
          clan: it.clan ?? undefined,
          village: it.village ?? it.origin ?? it.villageOf ?? undefined,
          occupation: it.occupation ?? it.rank ?? it.role ?? undefined,
          rank,
          chakraNature,
          jutsuCount,
          image: Array.isArray(it.images) ? it.images[0] : it.image ?? null,
          raw: it,
        }
      })
      return { page, perPage, total, data }
    } catch (err) {
      return { page, perPage, total: 0, data: [] }
    }
  }
}

function getPageRange(current: number, total: number | 'estimate') {
  const delta = 2
  const pages: Array<number | 'ellipsis'> = []
  const last = typeof total === 'number' ? total : current + 3
  let left = Math.max(1, current - delta)
  let right = Math.min(last, current + delta)

  if (left > 1) {
    pages.push(1)
    if (left > 2) pages.push('ellipsis')
  }
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < last) {
    if (right < last - 1) pages.push('ellipsis')
    pages.push(last)
  }
  return pages
}

export default async function CharactersPage({ searchParams }: { searchParams?: { page?: string } }) {
  const PER_PAGE = 50
  const page = Math.max(1, Number(searchParams?.page ?? '1'))

  const result = await fetchPage(page, PER_PAGE)

  const knownTotal = result?.total ?? 0
  const totalPages = knownTotal > PER_PAGE ? Math.max(1, Math.ceil(knownTotal / PER_PAGE)) : 1
  const start = (page - 1) * PER_PAGE + 1
  const end = Math.min(start + PER_PAGE - 1, result?.total ?? page * PER_PAGE)
  const isLastPage = Boolean(result && result.data.length < PER_PAGE)
  const pageItems = getPageRange(page, knownTotal > PER_PAGE ? totalPages : 'estimate')

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Characters</h2>
        <div className="flex items-center space-x-2">
          <Link
            href={`?page=${Math.max(1, page - 1)}`}
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
            className={`px-3 py-2 rounded text-sm ${page <= 1 ? 'bg-slate-200 text-slate-500 pointer-events-none opacity-50' : 'bg-slate-200 hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'}`}
          >
            <span className="sr-only">Previous page</span>
            Prev
          </Link>

          {/* numbered pages */}
          <nav className="inline-flex items-center" aria-label="Pagination">
            <ul className="inline-flex items-center space-x-1" role="list">
              {pageItems.map((it, idx) => (
                it === 'ellipsis' ? (
                  <li key={`e-${idx}`}><span className="px-2 text-sm text-slate-500">…</span></li>
                ) : (
                  <li key={it}>
                    <Link
                      href={`?page=${it}`}
                      aria-current={it === page ? 'page' : undefined}
                      className={`px-3 py-2 rounded text-sm ${it === page ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'}`}
                    >
                      {it}
                      {it === page && <span className="sr-only"> — current page</span>}
                    </Link>
                  </li>
                )
              ))}
            </ul>
          </nav>

          <Link
            href={`?page=${page + 1}`}
            aria-disabled={isLastPage}
            tabIndex={isLastPage ? -1 : undefined}
            className={`px-3 py-2 rounded text-sm ${isLastPage ? 'bg-indigo-600 text-white opacity-50 pointer-events-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'}`}
          >
            <span className="sr-only">Next page</span>
            Next
          </Link>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        {knownTotal > PER_PAGE ? (
          <>Showing {start}–{end} of {result.total} characters (page {page} of {totalPages})</>
        ) : (
          <>Showing characters {start}–{end} (page {page})</>
        )}
      </p>

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {(result.data || []).map((c: any) => (
            <div key={c._id || c.id || c.name} className="h-full">
              <CharacterCard character={c} />
            </div>
          ))}
        </div>
      )}

      {result && (result.data || []).length === 0 && (
        <p className="text-slate-500 mt-6">No characters found on this page.</p>
      )}
    </div>
  )
}
