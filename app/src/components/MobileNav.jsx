import { NavLink, useLocation } from 'react-router-dom';
import { sections } from '../content/manifest.js';

export default function MobileNav({ open, onClose }) {
  const { pathname } = useLocation();
  const sectionSlug = pathname.split('/').filter(Boolean)[0];
  const activeSection = sections.find((s) => s.slug === sectionSlug);

  if (!open) return null;

  return (
    <div className="mobile-nav-overlay" onMouseDown={onClose}>
      <nav className="mobile-nav-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="sidebar-group">
          <p className="sidebar-group-title">Browse</p>
          <ul>
            {sections.map((section) => (
              <li key={section.slug}>
                <NavLink
                  to={`/${section.slug}/${section.pages[0].slug}`}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                  onClick={onClose}
                >
                  {section.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {activeSection && (
          <div className="sidebar-group">
            <p className="sidebar-group-title">{activeSection.title}</p>
            <ul>
              {activeSection.pages.map((page) => (
                <li key={page.slug}>
                  <NavLink
                    to={`/${activeSection.slug}/${page.slug}`}
                    className={({ isActive }) => (isActive ? 'active' : undefined)}
                    onClick={onClose}
                  >
                    {page.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </div>
  );
}
