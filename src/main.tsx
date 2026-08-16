import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/production-hardening.css';
import './styles/schoolcoin-animations.css';
import './styles/ios-polish.css';
import './styles/performance.css';
import './styles/accessibility.css';
import './styles/ui-system.css';
import { SitePreferencesProvider } from './lib/site-preferences.tsx';

const root = document.getElementById('root');
if (!root) throw new Error('Application root element was not found.');

createRoot(root).render(
  <StrictMode>
    <SitePreferencesProvider><App /></SitePreferencesProvider>
  </StrictMode>
);
