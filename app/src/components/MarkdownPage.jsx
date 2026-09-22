import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { findPage } from '../content/manifest.js';
import { useDocumentHead } from '../hooks/useDocumentHead.js';

export function contentUrl(sectionSlug, pageSlug) {
  return `${import.meta.env.BASE_URL}content/${sectionSlug}/${pageSlug}.md`;
}

// Derives a meta description from a page's markdown: skip the leading "# Title"
// heading and any intro blockquote, strip markdown syntax from the next
// paragraph, and truncate to a search-result-friendly length.
export function deriveDescription(markdown) {
  const paragraph = markdown
    .split('\n')
    .find((line) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('>');
    });
  if (!paragraph) return '';

  const plain = paragraph
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim();

  return plain.length > 155 ? `${plain.slice(0, 154).trimEnd()}…` : plain;
}

export default function MarkdownPage() {
  const { sectionSlug, pageSlug } = useParams();
  const [state, setState] = useState({ status: 'loading', text: '' });
  const match = findPage(sectionSlug, pageSlug);

  useEffect(() => {
    if (!match) return;
    let cancelled = false;
    setState({ status: 'loading', text: '' });

    fetch(contentUrl(sectionSlug, pageSlug))
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load page (${res.status})`);
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setState({ status: 'ready', text });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: 'error', text: err.message });
      });

    return () => {
      cancelled = true;
    };
    // `match` is deterministically derived from sectionSlug/pageSlug and is a
    // freshly-allocated object each render — depending on it would refetch forever.
  }, [sectionSlug, pageSlug]);

  useDocumentHead({
    title: match ? `${match.page.title} — Interview Drill` : undefined,
    description: state.status === 'ready' ? deriveDescription(state.text) : undefined,
  });

  if (!match) {
    return (
      <div className="page-error">
        Page not found. <Link to="/">Go home</Link>.
      </div>
    );
  }

  if (state.status === 'loading') {
    return <div className="page-loading">Loading…</div>;
  }

  if (state.status === 'error') {
    return <div className="page-error">Couldn&apos;t load this page: {state.text}</div>;
  }

  return (
    <article className="markdown-page">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={{ a: MarkdownLink }}>
        {state.text}
      </ReactMarkdown>
    </article>
  );
}

// Internal links (e.g. "/react/rendering") get client-side routed with <Link>, so
// navigation stays inside the SPA and respects the app's base path automatically.
// Anything else (http/https, mailto, etc.) renders as a normal external link.
function MarkdownLink({ href, children, ...props }) {
  if (href?.startsWith('/')) {
    return (
      <Link to={href} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}
