import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { I18nProvider } from './i18n';
import './index.css';
import './styles/production-hardening.css';
import './styles/schoolcoin-animations.css';
import './styles/ios-polish.css';
import './styles/accessibility-responsive.css';
import './styles/luxury-v2.css';
import './styles/premium-system.css';
import './styles/premium-sections.css';
import './styles/premium-cursor.css';
import './styles/premium-glass-system.css';

document.documentElement.lang = 'uz';
document.documentElement.dir = 'ltr';
document.documentElement.classList.remove('dark');
document.documentElement.dataset.theme = 'light';
document.documentElement.style.colorScheme = 'light';
localStorage.removeItem('site_theme');
localStorage.setItem('site_locale', 'uz');
localStorage.setItem('locale', 'uz');
localStorage.setItem('language', 'uz');

const root = document.getElementById('root');
if (!root) throw new Error('Application root element was not found.');

createRoot(root).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>
);
