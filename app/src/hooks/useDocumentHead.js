import { useEffect } from 'react';

function upsertMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function useDocumentHead({ title, description }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) upsertMeta('description', description);
  }, [title, description]);
}
