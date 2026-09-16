import { NavLink, useLocation } from 'react-router-dom';
import { sections } from '../content/manifest.js';

export default function Sidebar() {
  // Sidebar lives outside <Routes>, so useParams() wouldn't see the active
  // route's params here — derive the section from the URL directly instead.
  const { pathname } = useLocation();
  const sectionSlug = pathname.split('/').filter(Boolean)[0];
  const section = sections.find((s) => s.slug === sectionSlug);

  if (!section) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-group">
        <p className="sidebar-group-title">{section.title}</p>
        <ul>
          {section.pages.map((page) => (
            <li key={page.slug}>
              <NavLink
                to={`/${section.slug}/${page.slug}`}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {page.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
