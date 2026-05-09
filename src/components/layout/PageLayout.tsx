import React from 'react';
import { Navbar } from './Navbar';

export const PageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
    <Navbar />
    <main style={{ flex: 1, overflowY: 'auto' }}>
      {children}
    </main>
  </div>
);
