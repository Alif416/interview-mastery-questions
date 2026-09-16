import { Link } from 'react-router-dom';
import { sections } from '../content/manifest.js';

export default function Home() {
  return (
    <div className="home">
      <h1>
        Interview Mastery
        <span className="home-subtitle">Coding interview notes, organized</span>
      </h1>

      <p className="home-tagline">
        A structured path through LeetCode patterns and JavaScript fundamentals — built for
        focused review, not endless scrolling.
      </p>

      <div className="home-sections">
        {sections.map((section) => (
          <div className="home-section-card" key={section.slug}>
            <div className="home-section-card-header">
              <span className="home-section-icon" aria-hidden="true">
                {section.icon}
              </span>
              <div>
                <div className="home-section-card-title-row">
                  <h2>{section.title}</h2>
                  <span className="home-section-count">{section.pages.length}</span>
                </div>
                <p>{section.description}</p>
              </div>
            </div>
            <ul className="home-section-list">
              {section.pages.map((page) => (
                <li key={page.slug}>
                  <Link to={`/${section.slug}/${page.slug}`}>{page.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
