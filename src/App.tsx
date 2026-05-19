import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import './styles/globals.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';

import StudioPage    from './pages/StudioPage';
import LibraryPage   from './pages/LibraryPage';
import TemplatesPage from './pages/TemplatesPage';
import PricingPage   from './pages/PricingPage';
import LoginPage     from './pages/LoginPage';
import SignUpPage    from './pages/SignUpPage';
import LogsPage      from './pages/LogsPage';

// ── Route guard ───────────────────────────────────────────────────────────────

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, checked } = useAuth();
  // Wait for the /api/auth/me check before deciding
  if (!checked) return null;
  if (!token)   return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: undefined,
        token: {
          colorPrimary:        '#7AABB8',
          colorLink:           '#7AABB8',
          colorLinkHover:      '#94BDC8',
          fontFamily:          "'DM Sans', sans-serif",
          borderRadius:        8,
          borderRadiusLG:      12,
          colorBgBase:         '#070C14',
          colorBgContainer:    '#0D1720',
          colorBgElevated:     '#132030',
          colorBorder:         '#1E3040',
          colorBorderSecondary:'#2A3F52',
          colorText:           '#C8D8E4',
          colorTextSecondary:  '#6A8898',
          colorTextQuaternary: '#3A5265',
          colorFill:           '#132030',
          colorFillSecondary:  '#1A2A38',
          colorFillTertiary:   '#0D1720',
        },
        components: {
          Slider: {
            trackBg:          '#7AABB8',
            trackHoverBg:     '#94BDC8',
            handleColor:      '#7AABB8',
            handleActiveColor:'#94BDC8',
            railBg:           '#1E3040',
            railHoverBg:      '#2A3F52',
          },
          Tabs: {
            itemColor:         '#6A8898',
            itemSelectedColor: '#7AABB8',
            inkBarColor:       '#7AABB8',
            itemHoverColor:    '#C8D8E4',
            colorBgContainer:  '#0D1720',
          },
          Progress: {
            remainingColor: '#1E3040',
          },
          Drawer: {
            colorBgElevated: '#0D1720',
          },
          Segmented: {
            itemSelectedBg:    '#7AABB8',
            itemSelectedColor: '#070C14',
            trackBg:           '#132030',
            itemColor:         '#6A8898',
          },
          Button: {
            colorBgContainer:  '#132030',
            defaultBorderColor:'#2A3F52',
            defaultColor:      '#6A8898',
          },
          Select: {
            colorBgContainer:  '#132030',
            optionActiveBg:    '#1A2A38',
          },
          Tag: {
            colorBgContainer: 'rgba(122,171,184,0.12)',
            colorBorder:      'rgba(122,171,184,0.28)',
            colorText:        '#7AABB8',
          },
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/signup"   element={<SignUpPage />} />
            <Route path="/pricing"  element={<PricingPage />} />

            {/* Protected */}
            <Route path="/"          element={<Navigate to="/studio" replace />} />
            <Route path="/studio"    element={<RequireAuth><StudioPage /></RequireAuth>} />
            <Route path="/library"   element={<RequireAuth><LibraryPage /></RequireAuth>} />
            <Route path="/templates" element={<RequireAuth><TemplatesPage /></RequireAuth>} />
            <Route path="/logs"      element={<RequireAuth><LogsPage /></RequireAuth>} />
            <Route path="*"          element={<Navigate to="/studio" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}
