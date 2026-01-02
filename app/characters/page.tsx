import CharacterCard from '../../components/CharacterCard'

type Props = { searchParams?: { page?: string } }

const PER_PAGE = 50

async function fetchCharacters() {
  const PRIMARY_API = process.env.NARUTO_API || 'https://naruto-api.fly.dev/characters'
  const FALLBACK_API = process.env.NARUTO_FALLBACK || 'https://dattebayo-api.onrender.com/characters'

  let all: any = null
  try {
    const res = await fetch(PRIMARY_API, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error('primary failed')
    all = await res.json()
  } catch (e) {
    try {
      const res2 = await fetch(FALLBACK_API, { next: { revalidate: 60 } })
      if (!res2.ok) throw new Error('fallback failed')
      all = await res2.json()
    } catch (err) {
      return { total: 0, items: [], source: null, error: String(err) }
    }
  }

  const items = Array.isArray(all)
    ? all
    : Array.isArray(all?.data)
    ? all.data
    : Array.isArray(all?.characters)
    ? all.characters
    : []

  return { total: items.length, items, source: Array.isArray(all) ? PRIMARY_API : (Array.isArray(all?.data) ? PRIMARY_API : FALLBACK_API), error: null }
}

export default async function CharactersPage({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams?.page || '1'))

  const { total, items, source } = await fetchCharacters()
  const start = (page - 1) * PER_PAGE
  const pageItems = items.slice(start, start + PER_PAGE)
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Characters</h2>
        <p className="text-sm text-slate-600">Showing page {page} of {totalPages} — {total} total characters</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pageItems.map((c: any) => (
          <CharacterCard key={c.id ?? c._id ?? c.name} character={{ id: c.id ?? c._id, name: c.name ?? c.fullName ?? c.title, clan: c.clan, image: Array.isArray(c.images) ? c.images[0] : c.image }} />
        ))}
      </div>

      {pageItems.length === 0 && (
        <div className="mt-6">
          <p className="text-slate-500">No characters found on this page.</p>
          {source && <p className="text-xs text-slate-400 mt-2">Data source: {source}</p>}
        </div>
      )}

      {total > PER_PAGE && (
        <div className="mt-6 flex items-center gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={`link-${p}`}
              href={`/characters?page=${p}`}
              className={`px-3 py-1 rounded-lg text-sm border ${p === page ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
              aria-current={p === page ? 'page' : undefined}
            >{p}</a>
          ))}
        </div>
      )}
    </div>
  )
}
