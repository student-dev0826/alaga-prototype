import { useEffect, useId, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from '../../components/icons';
import { useSearch } from './SearchContext';
import { getSuggestions } from './suggestions';
export default function SearchForm({ compact = false, initialQuery = '' }: { compact?: boolean; initialQuery?: string }) {
  const id = useId();
  const [value, setValue] = useState(initialQuery);
  const [debounced, setDebounced] = useState('');
  const [focused, setFocused] = useState(false);
  const { setQuery } = useSearch();
  const navigate = useNavigate();
  useEffect(() => { const timer = window.setTimeout(() => setDebounced(value), 250); return () => window.clearTimeout(timer); }, [value]);
  const matches = compact ? [] : getSuggestions(debounced);
  function search(query: string) {
    if (!query.trim()) return;
    setQuery(query.trim()); setFocused(false); navigate('/search');
  }
  function submit(event: FormEvent) { event.preventDefault(); search(value); }
  return <div className={`search-component ${compact ? 'compact' : ''}`}>
    <form onSubmit={submit} className="search-form" role="search" aria-label={compact ? 'Header healthcare search' : 'Healthcare service search'}>
      <div className="search-field"><SearchIcon size={20} />
        <label htmlFor={id} className="sr-only">Search for a health service or facility</label>
        <input id={id} type="search" maxLength={200} autoComplete="off" value={value} required
          onChange={event => setValue(event.target.value)} onFocus={() => setFocused(true)}
          onKeyDown={event => { if (event.key === 'Escape') setFocused(false); }}
          onBlur={event => { if (!event.currentTarget.parentElement?.parentElement?.parentElement?.contains(event.relatedTarget)) setFocused(false); }}
          placeholder={compact ? 'Search centers, services…' : 'Search for a health service or describe what you need'}
          aria-describedby={compact ? undefined : `${id}-hint`} />
      </div>
      <button className="button search-button" type="submit" aria-label={compact ? 'Search from header' : 'Search healthcare services'}>{compact ? <SearchIcon size={20} /> : 'Search'}</button>
    </form>
    {!compact && <p id={`${id}-hint`} className="search-hint">e.g. “I want to get dialysis” or “I need vaccination”</p>}
    {focused && matches.length > 0 && <div className="suggestions" aria-label="Suggested searches">
      {matches.map(match => <button className="suggestion" key={match} onClick={() => { setValue(match); search(match); }}>{match}</button>)}
    </div>}
  </div>;
}
