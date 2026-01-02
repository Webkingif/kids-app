'use client'
import { useEffect, useState } from 'react'
import CharacterCard from '../../components/CharacterCard'

type PageData = {
  page: number
  perPage: number
  total: number
  data: any[]
}

export default function CharactersPage() {
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PageData | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch(`/api/characters?page=${page}`)
      .then((r) => r.json())
      .then((data: PageData) => {
        if (mounted) setResult(data)
      })
      .catch(() => setResult(null))
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [page])

  const totalPages = result ? Math.ceil(result.total / (result.perPage || 50)) : 1

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Characters</h2>
        <div className="space-x-2">
          <button
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-2 bg-slate-200 rounded disabled:opacity-50"
          >Prev</button>
          <button
            disabled={result ? page >= totalPages || loading : true}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
          >Next</button>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-4">Showing page {page} of {totalPages}{result && ` — ${result.total} total characters`}</p>

      {loading && <p>Loading…</p>}

      {!loading && result && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {result.data.map((c) => (
            <CharacterCard key={c._id || c.id || c.name} character={c} />
          ))}
        </div>
      )}

      {!loading && result && result.data.length === 0 && (
        <p className="text-slate-500 mt-6">No characters found on this page.</p>
      )}
    </div>
  )
}
