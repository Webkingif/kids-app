import { normalizeCharacter } from '../../api/characters/route'

export default async function CharacterPage({ params }: { params: { id: string } }) {
  const id = params.id
  const NARUTO_API = process.env.NARUTO_API || 'https://dattebayo-api.onrender.com/characters'
  const FALLBACK = process.env.NARUTO_FALLBACK || 'https://naruto-api.fly.dev/characters'

  // Try fetching direct by id
  let character: any = null
  try {
    const res = await fetch(`${NARUTO_API}/${encodeURIComponent(id)}`, { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      const it = Array.isArray(json) ? json[0] : json
      character = normalizeCharacter(it)
    }
  } catch (e) {
    // ignore and try fallback
  }

  if (!character) {
    try {
      const fres = await fetch(FALLBACK, { cache: 'no-store' })
      if (fres.ok) {
        const all = await fres.json()
        const items = Array.isArray(all) ? all : Array.isArray(all?.data) ? all.data : []
        const match = items.find((it: any) => String(it.id) === String(id) || String(it._id) === String(id) || String(it.name)?.toLowerCase() === String(id)?.toLowerCase())
        if (match) character = normalizeCharacter(match)
      }
    } catch (err) {
      // no-op
    }
  }

  if (!character) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Character not found</h1>
        <p className="text-slate-600 mt-2">We couldn't find that character. Try the characters list.</p>
      </div>
    )
  }

  // Child-friendly data extraction
  const age = character.raw?.age ?? character.raw?.birthday ?? undefined
  const parents = character.raw?.parents ?? character.raw?.parent ?? character.raw?.parentsName ?? undefined

  function asText(value: any) {
    if (value === undefined || value === null) return undefined
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
    if (Array.isArray(value)) return value.join(', ')
    const vals = Object.values(value || {}).filter(Boolean)
    if (vals.length) return vals.join(', ')
    try {
      return JSON.stringify(value)
    } catch (e) {
      return String(value)
    }
  }

  const parentsText = asText(parents)
  const occupationText = asText(character.occupation)
  const chakraText = asText(character.chakraNature)
  const clanText = asText(character.clan)
  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 bg-gradient-to-br from-amber-100 to-rose-100 p-6 flex items-center justify-center">
            {character.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={character.image} alt={character.name} className="w-48 h-48 rounded-full object-cover shadow-lg transform transition-transform duration-500 hover:scale-105" />
            ) : (
              <div className="w-48 h-48 rounded-full bg-slate-200 flex items-center justify-center">?</div>
            )}
          </div>

          <div className="md:w-1/2 p-6 space-y-4">
            <h1 className="text-3xl font-extrabold">{character.name}</h1>
            <div className="flex items-center space-x-2">
              {character.village && <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">{character.village}</span>}
              {clanText && <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800">{clanText}</span>}
              {age && <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800">Age: {age}</span>}
              {character.rank && <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">{character.rank}</span>}
            </div>

            <p className="text-slate-700 text-lg">{character.raw?.description ?? character.raw?.about ?? character.raw?.bio ?? 'No description available.'}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 rounded-lg p-3 animate-pulse">
                <strong className="block text-sm text-indigo-800">Parents</strong>
                <div className="text-lg text-indigo-900">{parentsText ?? 'Unknown'}</div>
              </div>

              <div className="bg-rose-50 rounded-lg p-3">
                <strong className="block text-sm text-rose-700">Chakra</strong>
                <div className="text-lg text-rose-800">{chakraText ?? 'Unknown'}</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <strong className="block text-sm text-slate-700">Clan</strong>
                <div className="text-lg text-slate-800">{clanText ?? 'Unknown'}</div>
              </div>

              <div className="bg-sky-50 rounded-lg p-3">
                <strong className="block text-sm text-sky-700">Jutsu Count</strong>
                <div className="text-lg text-sky-800">{typeof character.jutsuCount === 'number' ? character.jutsuCount : 'Unknown'}</div>
              </div>

              <div className="bg-emerald-50 rounded-lg p-3">
                <strong className="block text-sm text-emerald-700">Occupation</strong>
                <div className="text-lg text-emerald-800">{occupationText ?? 'Unknown'}</div>
              </div>

              { /* Display the character's plan if present */ }
              {character.raw?.plan && (
                <div className="bg-amber-50 rounded-lg p-3 col-span-2">
                  <strong className="block text-sm text-amber-700">Plan</strong>
                  <div className="text-lg text-amber-800">{String(character.raw.plan)}</div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center space-x-3">
              <a href="/characters" className="px-4 py-2 bg-amber-400 text-white rounded-lg inline-block text-center">Back</a>
            </div>
          </div>
        </div>
      </div>


    </main>
  )
}
