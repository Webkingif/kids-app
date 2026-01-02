export default function CharacterCard({ character }: { character: any }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center text-center">
      <div className="w-28 h-28 bg-slate-100 rounded-full overflow-hidden mb-3 flex items-center justify-center">
        {character.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={character.image} alt={character.name} className="w-full h-full object-cover" />
        )}
        {!character.image && (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="3" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h3 className="font-semibold">{character.name}</h3>
      {character.clan && <p className="text-sm text-slate-500">{character.clan}</p>}
    </div>
  )
}
