import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
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
    <ConfigProvider
      theme={{
        token: {
          colorPrimary:       '#7C5CFC',
          colorLink:          '#7C5CFC',
          colorLinkHover:     '#9B7FFC',
          fontFamily:         "'DM Sans', sans-serif",
          borderRadius:       8,
          borderRadiusLG:     12,
          colorBgBase:        '#F7F6FF',
          colorBgContainer:   '#FFFFFF',
          colorBorder:        '#D8D6EE',
          colorText:          '#1A1829',
          colorTextSecondary: '#5C5A74',
          colorTextQuaternary:'#8E8CA6',
        },
        components: {
          Slider: {
            trackBg:       '#7C5CFC',
            trackHoverBg:  '#9B7FFC',
            handleColor:   '#7C5CFC',
            handleActiveColor: '#9B7FFC',
            railBg:        '#D8D6EE',
            railHoverBg:   '#C4C1E0',
          },
          Tabs: {
            itemColor:         '#5C5A74',
            itemSelectedColor: '#7C5CFC',
            inkBarColor:       '#7C5CFC',
            itemHoverColor:    '#1A1829',
          },
          Progress: {
            remainingColor: '#D8D6EE',
          },
          Drawer: {
            colorBgElevated: '#FFFFFF',
          },
          Segmented: {
            itemSelectedBg:    '#7C5CFC',
            itemSelectedColor: '#FFFFFF',
          },
        },
      }}
    >
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
    </ConfigProvider>
  );
}
