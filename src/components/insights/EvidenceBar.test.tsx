import { render, screen } from '@testing-library/react'
import { EvidenceBar } from './EvidenceBar'

describe('EvidenceBar', () => {
  it('shows proportion, interval and lift', () => {
    render(<EvidenceBar evidence={{ n: 8, total: 10, ciLow: 0.49, ciHigh: 0.94, lift: 2.9 }} />)
    expect(screen.getByText('8 de 10 crisis')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('49% a 94%')).toBeInTheDocument()
    expect(screen.getByText('x2.9')).toBeInTheDocument()
  })

  it('renders nothing without counts', () => {
    const { container } = render(<EvidenceBar evidence={{}} />)
    expect(container).toBeEmptyDOMElement()
  })
})
