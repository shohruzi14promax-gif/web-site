import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/production-hardening.css';
import './styles/schoolcoin-animations.css';

const root = document.getElementById('root');
if (!root) throw new Error('Application root element was not found.');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
