"use client"

import React from 'react'
import Link from 'next/link'

export default function CharacterCard({ character }: { character: any }) {
  const village = Array.isArray(character.village) ? character.village[0] : character.village

  let occupationText = ''
  if (character.occupation) {
    const occ = character.occupation
    let values: any[] = []
    if (typeof occ === 'string') values = [occ]
    else if (typeof occ === 'object') {
      values = Object.values(occ).flatMap((v: any) => (v && typeof v === 'object' ? Object.values(v) : [v]))
    } else values = [String(occ)]

    const tokens = values
      .flatMap((v) => (typeof v === 'string' ? v.split(',') : [String(v)]))
      .map((s) => s.trim())
      .filter(Boolean)
      // filter out purely numeric tokens (IDs like 012607)
      .filter((t) => !/^[\d-]+$/.test(t))

    occupationText = Array.from(new Set(tokens)).join(', ')
  }

  // rank (may be provided directly or as an object like {Part I: 'Genin'})
  const rank = typeof character.rank === 'string' ? character.rank : character.rank && typeof character.rank === 'object' ? (Array.isArray(Object.values(character.rank)) ? String(Object.values(character.rank).flat()[0]) : undefined) : undefined

  // chakra nature
  const chakra = Array.isArray(character.chakraNature) ? character.chakraNature.join(', ') : character.chakraNature ?? undefined

  // jutsu count
  const jutsuCount = typeof character.jutsuCount === 'number' ? character.jutsuCount : character.jutsuCount ? Number(character.jutsuCount) : undefined

  // compute badge colors by village name (basic heuristics)
  const villageKey = (village || '').toLowerCase()
  const villageClasses = villageKey.includes('leaf') || villageKey.includes('konoha')
    ? 'bg-emerald-100 text-emerald-800'
    : villageKey.includes('sand')
    ? 'bg-amber-100 text-amber-800'
    : villageKey.includes('mist')
    ? 'bg-sky-100 text-sky-800'
    : villageKey.includes('cloud') || villageKey.includes('kumogakure')
    ? 'bg-slate-100 text-slate-800'
    : villageKey.includes('sound')
    ? 'bg-purple-100 text-purple-800'
    : 'bg-indigo-100 text-indigo-800'

  const iconClass = 'inline-block align-middle mr-1 h-3 w-3'

  const desc = character.raw?.description ?? character.raw?.about ?? character.raw?.bio ?? character.raw?.summary

  const idPath = character.id ?? character._id ?? encodeURIComponent(String(character.name || '').toLowerCase().replace(/\s+/g, '-'))

  return (
    <div className="relative h-full">
      <Link href={`/characters/${idPath}`} className="group block h-full bg-white rounded-lg shadow p-4 flex flex-col items-center text-center relative transform transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
        <div className="w-28 h-28 bg-slate-100 rounded-full overflow-hidden mb-3 flex items-center justify-center">
          {character.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={character.image} alt={character.name} className="w-full h-full object-cover transition-transform duration-200 transform group-hover:scale-105" />
          )}
          {!character.image && (
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="3" stroke="#94a3b8" strokeWidth="1.5" />
              <path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>

        {/* village badge */}
        {village && (
          <span className={`inline-flex items-center ${villageClasses} text-xs font-medium px-2 py-0.5 rounded-full mb-2`} aria-label={`Village: ${village}`}>
            {/* small map-pin icon */}
            <svg className={`${iconClass}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="8" r="2.1" fill="currentColor" />
            </svg>
            <span className="align-middle">{village}</span>
          </span>
        )}

        <h3 className="font-semibold">{character.name}</h3>

        <div className="mt-1 text-sm text-slate-500 space-y-1">
          {character.clan && (
            <div><svg className={`${iconClass} text-slate-400`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden><path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1 3-6z" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round"/></svg>{character.clan}</div>
          )}

          {occupationText && (
            <div><svg className={`${iconClass} text-slate-400`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden><path d="M3 7h18M6 11h12M4 15h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>Occupation: {occupationText}</div>
          )}

          {rank && (
            <div><svg className={`${iconClass} text-yellow-500`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden><path d="M12 2l2.39 4.85L19 8l-3.5 3.04L16.78 16 12 13.77 7.22 16l1.28-4.96L5 8l4.61-.15L12 2z" fill="currentColor"/></svg>Rank: {rank}</div>
          )}

          {chakra && (
            <div><svg className={`${iconClass} text-rose-500`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden><path d="M12 3c-3 0-5 3-5 6 0 4 5 8 5 8s5-4 5-8c0-3-2-6-5-6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>Chakra: {chakra}</div>
          )}

          {typeof jutsuCount === 'number' && (
            <div><svg className={`${iconClass} text-indigo-500`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden><path d="M4 7h16M4 12h10M4 17h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>Jutsu: {jutsuCount}</div>
          )}
        </div>
      </Link>
    </div>
  )
}
