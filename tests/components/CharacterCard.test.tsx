import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CharacterCard from '../../components/CharacterCard'

describe('CharacterCard', () => {
  it('renders village badge with correct aria-label and class heuristic', () => {
    render(<CharacterCard character={{ name: 'Naruto', village: 'Konoha' }} />)
    const badge = screen.getByLabelText('Village: Konoha')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-emerald-100')
  })

  it('sanitizes numeric-only occupation tokens', () => {
    render(
      <CharacterCard
        character={{ name: 'Killer B', occupation: '012607', village: 'Cloud', jutsuCount: 18 }}
      />
    )
    // occupation is numeric-only so it should be filtered out and not appear
    expect(screen.queryByText(/Occupation:/)).toBeNull()
    // rank or jutsu should still be present
    expect(screen.getByText(/Jutsu:/)).toBeInTheDocument()
  })

  it('shows chakra, rank and jutsu count', () => {
    render(
      <CharacterCard
        character={{ name: 'Sasuke', chakraNature: ['Fire'], rank: 'Genin', jutsuCount: 75 }}
      />
    )
    expect(screen.getByText(/Chakra:/)).toBeInTheDocument()
    expect(screen.getByText(/Rank:/)).toBeInTheDocument()
    expect(screen.getByText(/Jutsu:/)).toBeInTheDocument()
  })

  it('navigates to character detail page via link', () => {
    render(<CharacterCard character={{ id: '42', name: 'Naruto', village: 'Konoha' }} />)
    const link = screen.getByRole('link') as HTMLAnchorElement
    expect(link).toBeInTheDocument()
    expect(link.getAttribute('href')).toBe('/characters/42')
  })
})
