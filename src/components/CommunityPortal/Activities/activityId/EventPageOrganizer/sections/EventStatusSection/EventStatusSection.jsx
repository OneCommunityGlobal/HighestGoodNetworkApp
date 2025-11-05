import { UserCircleIcon } from 'lucide-react';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import styles from './EventStatusSection.module.css';

const navigationItems = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'BM Dashboard', href: '#bm-dashboard' },
  { label: 'Timelog', href: '#timelog' },
  { label: 'Project', href: '#project' },
  { label: 'Reports', href: '#reports' },
];

export const EventStatusSection = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>HGN Logo</div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navigationItems.map((item, index) => (
            <li key={index}>
              <Button
                variant="ghost"
                className="h-auto p-0 [font-family:'Inter',Helvetica] font-normal text-white text-sm tracking-[0] leading-[normal] hover:bg-transparent hover:text-white/80 transition-colors"
                asChild
              >
                <a href={item.href}>{item.label}</a>
              </Button>
            </li>
          ))}
        </ul>

        <div className={styles.userSection}>
          <Avatar className={styles.avatar}>
            <AvatarImage
              src="https://c.animaapp.com/mhkba7ef3J2kka/img/carbon-user-avatar-filled-alt.svg"
              alt="User avatar"
            />
            <AvatarFallback>
              <UserCircleIcon className="w-8 h-8 text-white" />
            </AvatarFallback>
          </Avatar>

          <span className={styles.welcomeText}>Welcome, BM&apos;s Name</span>
        </div>
      </nav>
    </header>
  );
};
