import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';

import StudioPage    from './pages/StudioPage';
import LibraryPage   from './pages/LibraryPage';
import TemplatesPage from './pages/TemplatesPage';
import PricingPage   from './pages/PricingPage';
import LoginPage     from './pages/LoginPage';
import SignUpPage    from './pages/SignUpPage';
import LogsPage      from './pages/LogsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Navigate to="/studio" replace />} />
        <Route path="/studio"    element={<StudioPage />} />
        <Route path="/library"   element={<LibraryPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/pricing"   element={<PricingPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/signup"    element={<SignUpPage />} />
        <Route path="/logs"      element={<LogsPage />} />
        <Route path="*"          element={<Navigate to="/studio" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
