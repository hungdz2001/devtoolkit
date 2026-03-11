import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import Home from './pages/Home';
import ToolPage from './pages/ToolPage';
import NotFound from './pages/NotFound';
import RequestTool from './pages/RequestTool';
import { useStore } from './store';

export default function App() {
  const theme = useStore((s) => s.theme);

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <AppShell>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tool/:toolId" element={<ToolPage />} />
            <Route path="/request" element={<RequestTool />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppShell>
    </div>
  );
}
