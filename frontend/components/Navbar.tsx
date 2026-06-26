'use client';

import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { useState, useEffect } from 'react';

interface NavbarProps {
  sessionStatus?: 'idle' | 'active' | 'done';
  showLinks?: boolean;
}

export default function Navbar({ sessionStatus, showLinks = false }: NavbarProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as Document | HTMLElement;
      // Only trigger if the main document/window is scrolling (ignore inner divs/textareas)
      if (target === document || target === document.documentElement || target === document.body) {
        setScrolled(window.scrollY > 20);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, []);

  return (
    <header className={`topbar ${scrolled ? 'scrolled' : ''}`}>
      <button 
        onClick={() => router.push('/')} 
        className="topbar-logo" 
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <svg className="topbar-logo-icon" viewBox="0 0 22 22" fill="none">
          <path d="M11 2L18 6.5V15.5L11 20L4 15.5V6.5L11 2Z" fill="none" stroke="#6C63FF" strokeWidth="1.5"/>
          <path d="M11 6L15.5 8.75V14.25L11 17L6.5 14.25V8.75L11 6Z" fill="#6C63FF" opacity="0.5"/>
        </svg>
        <span className="topbar-logo-text">Future Founder Twin</span>
      </button>
      <div className="topbar-spacer" />
      {showLinks && (
        <>
          <a href="https://www.kaggle.com/competitions/vibecoding-agents-capstone-project" target="_blank" rel="noopener" className="topbar-link">Docs ↗</a>
          <a href="https://github.com" target="_blank" rel="noopener" className="topbar-link">GitHub ↗</a>
        </>
      )}
      <ThemeToggle />
      {sessionStatus && (
        <span className={`session-dot ${sessionStatus}`} title="Session status" />
      )}
    </header>
  );
}
