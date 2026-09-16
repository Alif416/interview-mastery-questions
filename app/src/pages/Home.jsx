import { Link } from 'react-router-dom';
import { sections } from '../content/manifest.js';
import { useDocumentHead } from '../hooks/useDocumentHead.js';

export default function Home() {
  useDocumentHead({
    title: 'Interview Drill — Coding Interview Notes',
    description: 'A structured library of interview prep notes — built for focused review, not endless scrolling.',
  });

  return (
    <div className="home">
      <h1>
        Interview Drill
        <span className="home-subtitle">Coding interview notes, organized</span>
      </h1>

      <p className="home-tagline">
        A structured library of interview prep notes — built for focused review, not endless
        scrolling.
      </p>

      <div className="home-sections">
        {sections.map((section) => {
          const firstPage = section.pages[0];
          return (
            <Link className="home-section-card" key={section.slug} to={`/${section.slug}/${firstPage.slug}`}>
              <span className="home-section-icon" aria-hidden="true">
                {section.icon}
              </span>
              <div className="home-section-card-title-row">
                <h2>{section.title}</h2>
                <span className="home-section-count">{section.pages.length} topics</span>
              </div>
              <p>{section.description}</p>
              <span className="home-section-cta">Browse →</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
