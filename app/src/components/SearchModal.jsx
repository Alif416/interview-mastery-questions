import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { allPages } from '../content/manifest.js';
import { contentUrl } from './MarkdownPage.jsx';

let indexPromise = null;

function loadIndex() {
  if (!indexPromise) {
    indexPromise = Promise.all(
      allPages().map(({ section, page }) =>
        fetch(contentUrl(section.slug, page.slug))
          .then((res) => (res.ok ? res.text() : ''))
          .then((text) => ({
            section,
            page,
            text: text.replace(/[`*_#>\-\[\]()]/g, ' ').replace(/\s+/g, ' '),
          }))
      )
    );
  }
  return indexPromise;
}

function snippetAround(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, 120);
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + query.length + 80);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      loadIndex().then(setEntries);
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  if (!open) return null;

  const results =
    query.trim().length === 0 || !entries
      ? []
      : entries
          .filter(
            ({ page, text }) =>
              page.title.toLowerCase().includes(query.toLowerCase()) ||
              text.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 8);

  function goTo(section, page) {
    navigate(`/${section.slug}/${page.slug}`);
    onClose();
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      const { section, page } = results[activeIndex];
      goTo(section, page);
    }
  }

  return (
    <div className="search-overlay" onMouseDown={onClose}>
      <div className="search-panel" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="search-input"
          placeholder="Search notes…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
        />
        <div className="search-results">
          {query.trim().length === 0 ? (
            <div className="search-empty">Type to search across all notes.</div>
          ) : results.length === 0 ? (
            <div className="search-empty">No results.</div>
          ) : (
            results.map(({ section, page, text }, i) => (
              <a
                key={`${section.slug}/${page.slug}`}
                className={`search-result${i === activeIndex ? ' active' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  goTo(section, page);
                }}
              >
                <span className="result-title">{page.title}</span>
                <span className="result-section">{section.title}</span>
                <div className="result-snippet">{snippetAround(text, query)}</div>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
