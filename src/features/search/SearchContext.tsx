import { createContext, useContext, useState, type ReactNode } from 'react';
interface SearchState { query: string; setQuery: (value: string) => void }
const SearchContext = createContext<SearchState | null>(null);
export function useSearch() {
  const state = useContext(SearchContext);
  if (!state) throw new Error('Search provider is missing');
  return state;
}
export default function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  // Healthcare search text stays in memory, never in URLs or persistent storage.
  return <SearchContext.Provider value={{ query, setQuery }}>{children}</SearchContext.Provider>;
}
