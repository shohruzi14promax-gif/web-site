import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { I18nProvider } from './i18n';
import './index.css';
import './styles/production-hardening.css';
import './styles/schoolcoin-animations.css';
import './styles/ios-polish.css';
import './styles/accessibility-responsive.css';

const root = document.getElementById('root');
if (!root) throw new Error('Application root element was not found.');

createRoot(root).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>
);
