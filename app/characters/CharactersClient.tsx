'use client'
import { useEffect, useState } from 'react'
import CharacterCard from '../../components/CharacterCard'

type PageData = {
  page: number
  perPage: number
  total: number
  data: any[]
}

const PER_PAGE = 50

export default function CharactersClient() {
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PageData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch(`/api/characters?page=${page}&perPage=${PER_PAGE}`)
      .then((r) => r.json())
      .then((data: any) => {
        if (!mounted) return
        const normalized: PageData = {
          page: Number(data?.page) || page,
          perPage: Number(data?.perPage) || PER_PAGE,
          total: Number(data?.total) || (Array.isArray(data?.data) ? data.data.length : 0),
          data: Array.isArray(data?.data) ? data.data : [],
        }
        setResult(normalized)
        setSource(data?.source ?? null)
        setError(data?.error ?? null)
      })
      .catch((err) => {
        if (mounted) {
          setResult({ page, perPage: PER_PAGE, total: 0, data: [] })
          setError(String(err))
          setSource(null)
        }
      })
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [page])

  const totalPages = result ? Math.max(1, Math.ceil(result.total / PER_PAGE)) : 1

  const getPageRange = (cur: number, total: number, maxButtons = 7) => {
    if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1)
    const delta = Math.floor(maxButtons / 2)
    let start = Math.max(1, cur - delta)
    let end = Math.min(total, cur + delta)
    if (start === 1) end = Math.min(total, maxButtons)
    if (end === total) start = Math.max(1, total - maxButtons + 1)
    const range: (number | '...')[] = []
    if (start > 1) {
      range.push(1)
      if (start > 2) range.push('...')
    }
    for (let i = start; i <= end; i++) range.push(i)
    if (end < total) {
      if (end < total - 1) range.push('...')
      range.push(total)
    }
    return range
  }

  return (
    <div>
      <p className="text-sm text-slate-600 mb-4">Showing page {page} of {totalPages}{result && ` — ${result.total} total characters`}</p>

      {!loading && error && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-3 rounded mb-4">
          <strong>Warning:</strong> {error}{source && ` (source: ${source})`}
        </div>
      )}

      {!loading && result && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(result.data || []).map((c) => (
            <CharacterCard key={c.id || c.name} character={c} />
          ))}
        </div>
      )}

      {!loading && result && (result.data || []).length === 0 && (
        <div className="mt-6">
          <p className="text-slate-500">No characters found on this page.</p>
          {source && <p className="text-xs text-slate-400 mt-2">Data source: {source}</p>}
        </div>
      )}

      {result && result.total > PER_PAGE && (
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-600 mr-2">Pages:</span>
          {getPageRange(page, totalPages).map((p, idx) => (
            typeof p === 'string' ? (
              <span key={`ell-${idx}`} className="px-2 text-sm text-slate-400">{p}</span>
            ) : (
              <button
                key={`page-${p}`}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded-lg text-sm border ${p === page ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                aria-current={p === page ? 'page' : undefined}
              >{p}</button>
            )
          ))}
        </div>
      )}

    </div>
  )
}
