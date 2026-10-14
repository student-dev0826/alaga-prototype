import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import EmptyState from '../components/EmptyState';
import { ServiceIcon } from '../components/icons';
import { categories } from './guideData';
export default function Guide({ article = false }: { article?: boolean }) {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const selected = categories.find(category => category.id === params.get('category'));
  const visible = categories.filter(category => category.name.toLowerCase().includes(query.toLowerCase()));
  return <div className="page"><PageTitle>{article ? 'Health Article' : 'Health Guide'}</PageTitle>
    {!article && <>
      <label className="field-label" htmlFor="guide-search">Find a health information category</label>
      <input className="input max-w-xl mb-6" id="guide-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search health information" />
      <h2 className="mb-4">Browse by Category</h2>
      <div className="category-grid">{visible.map(category => <button key={category.id} className={`panel category-card ${selected?.id === category.id ? 'chosen' : ''}`}
        aria-pressed={selected?.id === category.id} onClick={() => setParams(selected?.id === category.id ? {} : { category: category.id })}>
        <span className={`tile-icon ${category.color}`}><ServiceIcon name={category.icon} size={24} /></span><span className="font-bold">{category.name}</span><span className="muted">{category.desc}</span>
      </button>)}</div>
      {visible.length === 0 && <p role="status">No categories match this search. Try a different word.</p>}
    </>}
    <section className="panel mt-6" role="status"><EmptyState title={article ? 'Article unavailable' : selected ? `${selected.name}: no published articles yet` : 'No published articles yet'}>
      <p>Reviewed health information will appear here when available. Prototype medical advice is not published.</p>
    </EmptyState>{article && <Link to="/health-guide" className="button secondary mt-4">Back to Health Guide</Link>}</section>
  </div>;
}
