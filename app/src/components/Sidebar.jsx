import { NavLink } from 'react-router-dom';
import { sections } from '../content/manifest.js';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {sections.map((section) => (
        <div className="sidebar-group" key={section.slug}>
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
      ))}
    </aside>
  );
}
