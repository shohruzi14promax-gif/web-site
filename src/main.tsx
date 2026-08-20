import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ThemeMode from './components/ThemeMode';
import { I18nProvider } from './i18n';
import './index.css';
import './styles/production-hardening.css';
import './styles/schoolcoin-animations.css';
import './styles/ios-polish.css';

const root = document.getElementById('root');
if (!root) throw new Error('Application root element was not found.');

createRoot(root).render(
  <StrictMode>
    <I18nProvider>
      <App />
      <div className="fixed bottom-5 left-1/2 z-[110] -translate-x-1/2 rounded-2xl bg-slate-950/90 p-1 shadow-xl backdrop-blur-xl">
        <ThemeMode />
      </div>
    </I18nProvider>
  </StrictMode>
);
