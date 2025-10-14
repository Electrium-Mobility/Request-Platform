'use client';
import styles from '@/styles/Navbar.module.css';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

export default function Navbar({ onAddTask }: { onAddTask: () => void }) {
  const [active, setActive] = useState<string>('home');
  const scrollingToSection = useRef(false);

  useEffect(() => {
    const ids = ['home', 'tasks', 'help'];
    const secs = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (secs.length === 0) return;

    const probeY = 80; //dist from top of viewport

    const onScroll = () => {
      if (scrollingToSection.current) return;

      let current = ids[0];
      for (const s of secs) {
        const r = s.getBoundingClientRect();
        if (r.top <= probeY && r.bottom >= probeY) {
          current = s.id;
          break;
        }
      }

      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        current = ids[ids.length - 1];
      }

      setActive(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setActive('home');
    scrollingToSection.current = true;
    const element = document.getElementById('home');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { scrollingToSection.current = false; }, 1000);
  };

  const handleTasksClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setActive('tasks');
    scrollingToSection.current = true;
    const element = document.getElementById('tasks');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { scrollingToSection.current = false; }, 1000);
  };

  const handleHelpClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setActive('help');
    scrollingToSection.current = true;
    const element = document.getElementById('help');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { scrollingToSection.current = false; }, 1000);
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <Image src="/logo.png" alt="Electrium Mobility Logo" width={30} height={30} className={styles.logo} priority />
        <span className={styles.brand}>Electrium Mobility Task Platform</span>
      </div>

      <div className={styles.center}>
        <a href="#home" onClick={handleHomeClick} className={`${styles.link} ${active === 'home' ? styles.active : ''}`}>Home</a>
        <a href="#tasks" onClick={handleTasksClick} className={`${styles.link} ${active === 'tasks' ? styles.active : ''}`}>Tasks</a>
        <a href="#help" onClick={handleHelpClick} className={`${styles.link} ${active === 'help' ? styles.active : ''}`}>Help</a>
      </div>

      <div className={styles.right}>
        <button className="btn ghost" onClick={onAddTask}>Add Task</button>
      </div>
    </nav>
  );
}