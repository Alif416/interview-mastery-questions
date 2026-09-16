import { useCallback, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import MarkdownPage from './components/MarkdownPage.jsx';
import SearchModal from './components/SearchModal.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import { useTheme } from './hooks/useTheme.js';

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    function handleKeyDown(e) {
      const target = e.target;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        openSearch();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  return (
    <>
      <Navbar onOpenSearch={openSearch} theme={theme} onToggleTheme={toggleTheme} />
      <div className="layout">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:sectionSlug/:pageSlug" element={<MarkdownPage />} />
          </Routes>
          <Footer />
        </main>
      </div>
      <SearchModal open={searchOpen} onClose={closeSearch} />
    </>
  );
}
