import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { findPage } from '../content/manifest.js';

export function contentUrl(sectionSlug, pageSlug) {
  return `${import.meta.env.BASE_URL}content/${sectionSlug}/${pageSlug}.md`;
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
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {state.text}
      </ReactMarkdown>
    </article>
  );
}
