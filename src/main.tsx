import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import './app/i18n/i18n';
import { hydrateUiThemeFromStorage } from './lib/ui-theme';
import './styles.css';

hydrateUiThemeFromStorage();





const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
