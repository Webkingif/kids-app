import { describe, it, expect } from 'vitest'
import { normalizeCharacter } from '../../app/api/characters/route'

describe('normalizeCharacter', () => {
  it('extracts simple rank string', () => {
    const raw = { id: '1', name: 'Naruto', rank: 'Genin', jutsuCount: 10 }
    const out = normalizeCharacter(raw)
    expect(out.rank).toBe('Genin')
    expect(out.jutsuCount).toBe(10)
  })

  it('extracts rank from object', () => {
    const raw = { id: '2', name: 'Hiruzen', rank: { part1: 'Genin', part2: 'Kage' } }
    const out = normalizeCharacter(raw)
    expect(out.rank).toBe('Genin')
  })

  it('joins chakra array', () => {
    const raw = { id: '3', name: 'Sasuke', chakraNature: ['Fire', 'Lightning'] }
    const out = normalizeCharacter(raw)
    expect(out.chakraNature).toBe('Fire, Lightning')
  })

  it('counts jutsu from arrays', () => {
    const raw = { id: '4', name: 'JutsuGuy', techniques: [1, 2, 3] }
    const out = normalizeCharacter(raw)
    expect(out.jutsuCount).toBe(3)
  })

  it('handles missing optional fields', () => {
    const raw = { id: '5' }
    const out = normalizeCharacter(raw)
    expect(out.name).toBe('Unknown')
    expect(out.jutsuCount).toBeUndefined()
    expect(out.chakraNature).toBeUndefined()
  })

  it('normalizes occupation object into a string (filters numeric-only tokens)', () => {
    const raw = { id: '6', name: 'Testy', occupation: { ninjaRank: 'Genin', ninjaRegistration: '012345' } }
    const out = normalizeCharacter(raw)
    expect(out.occupation).toBe('Genin')
  })

  it('extracts nested occupation values', () => {
    const raw = { id: '7', name: 'BigBoss', occupation: { meta: { role: 'Kage', id: '001' } } }
    const out = normalizeCharacter(raw)
    expect(out.occupation).toBe('Kage')
  })
})
