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
                {sectionLogos[section.slug]?.() ?? section.icon}
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

function JsLogo() {
  return (
    <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="22" fill="#F7DF1E" />
      <text x="66" y="94" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="58" fill="#1a1a1a">
        JS
      </text>
    </svg>
  );
}

function LeetCodeLogo() {
  return (
    <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="22" fill="#1A1A1A" />
      <text x="64" y="90" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="46" fill="#FFA116">
        {'{ }'}
      </text>
    </svg>
  );
}

function ReactLogo() {
  return (
    <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="22" fill="#20232A" />
      <g fill="none" stroke="#61DAFB" strokeWidth="6">
        <ellipse cx="64" cy="64" rx="44" ry="18" />
        <ellipse cx="64" cy="64" rx="44" ry="18" transform="rotate(60 64 64)" />
        <ellipse cx="64" cy="64" rx="44" ry="18" transform="rotate(120 64 64)" />
      </g>
      <circle cx="64" cy="64" r="7" fill="#61DAFB" />
    </svg>
  );
}

function TsLogo() {
  return (
    <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="22" fill="#3178C6" />
      <text x="64" y="90" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="52" fill="#ffffff">
        TS
      </text>
    </svg>
  );
}

const sectionLogos = {
  'javascript-mastery': JsLogo,
  leetcode: LeetCodeLogo,
  react: ReactLogo,
  typescript: TsLogo,
};
