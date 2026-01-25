import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchDrug from './SearchDrug';
import { selectedDrugs } from '../../lib/stores/medicationStore';

// Mock de fetch global
vi.stubGlobal('fetch', vi.fn());

describe('SearchDrug Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectedDrugs.set([]); // On vide le store avant chaque test
  });

  it('renders the input field', () => {
    render(<SearchDrug />);
    const input = screen.getByPlaceholderText(/rechercher un médicament/i);
    expect(input).toBeInTheDocument();
  });

  it('searches for drugs when typing', async () => {
    const mockDrugs = [
      { cis: '123', nom: 'DOLIPRANE 500mg', substances: [] }
    ];
    
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockDrugs,
    });

    render(<SearchDrug />);
    const input = screen.getByPlaceholderText(/rechercher un médicament/i);

    fireEvent.change(input, { target: { value: 'Doli' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/search?q=Doli'));
    });

    const suggestion = await screen.findByText(/DOLIPRANE 500mg/i);
    expect(suggestion).toBeInTheDocument();
  });

  it('adds a drug to the store when a suggestion is clicked', async () => {
    const mockDrug = { cis: '123', nom: 'DOLIPRANE 500mg', substances: [{ nom: 'PARACETAMOL' }] };
    
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [mockDrug],
    });

    render(<SearchDrug />);
    const input = screen.getByPlaceholderText(/rechercher un médicament/i);

    fireEvent.change(input, { target: { value: 'Doli' } });

    const suggestion = await screen.findByText(/DOLIPRANE 500mg/i);
    fireEvent.click(suggestion);

    // On vérifie que le store contient bien le médicament
    expect(selectedDrugs.get()).toContainEqual(mockDrug);
  });
});
