import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './App';
import './index.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <BrowserRouter>
    <Routes>
      <Route path={'/'}     element={<App />} />
    </Routes>
  </BrowserRouter>
);
