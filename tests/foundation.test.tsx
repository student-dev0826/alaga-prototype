import { describe, expect, it, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SearchProvider from '../src/features/search/SearchContext';
import SearchForm from '../src/features/search/SearchForm';
import Directory from '../src/routes/Directory';
import PreferencesProvider, { readPreferences } from '../src/features/accessibility/Preferences';
import Profile from '../src/routes/Profile';
import Booking from '../src/routes/Booking';
import { getSuggestions } from '../src/features/search/suggestions';

beforeEach(() => localStorage.clear());
describe('safe foundation behavior', () => {
  it('preserves the actual query without exposing it in the URL or returning prototype providers', async () => {
    render(<MemoryRouter><SearchProvider><Routes>
      <Route path="/" element={<SearchForm />} /><Route path="/search" element={<Directory search />} />
    </Routes></SearchProvider></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Search for a health service or facility'), { target: { value: 'I need a dental checkup' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search healthcare services' }));
    expect(await screen.findByRole('heading', { name: 'Results for “I need a dental checkup”' })).toBeInTheDocument();
    expect(screen.getByText('0 verified facilities available.')).toBeInTheDocument();
    expect(screen.queryByText('Sample Community Dental Clinic')).not.toBeInTheDocument();
    expect(localStorage.length).toBe(0);
  });
  it('persists functional accessibility preferences and recovers from malformed storage', async () => {
    localStorage.setItem('alaga-accessibility-v1', '{broken');
    expect(readPreferences().textSize).toBe('standard');
    render(<MemoryRouter><PreferencesProvider><Profile accessibilityOnly /></PreferencesProvider></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Text Size'), { target: { value: 'extra-large' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /High Contrast/ }));
    await waitFor(() => expect(document.documentElement.dataset.textSize).toBe('extra-large'));
    expect(document.documentElement.dataset.contrast).toBe('true');
    expect(readPreferences()).toMatchObject({ textSize: 'extra-large', highContrast: true });
    fireEvent.click(screen.getByRole('button', { name: 'Reset preferences' }));
    await waitFor(() => expect(document.documentElement.dataset.contrast).toBe('false'));
  });
  it('does not collect patient data or offer simulated booking confirmation', () => {
    render(<MemoryRouter><Booking /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Online booking is not yet available' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
  });
  it('normalizes suggestion input and does not replace unknown queries', () => {
    expect(getSuggestions('  DIA  ')).toEqual(['Dialysis']);
    expect(getSuggestions('unlisted healthcare need')).toEqual([]);
    expect(getSuggestions('')).toEqual([]);
  });
});
