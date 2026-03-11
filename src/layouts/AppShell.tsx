import { ReactNode, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import DonateButton from '../components/DonateButton';
import { useStore } from '../store';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main
          className={`flex-1 transition-all duration-300 p-4 md:p-6 lg:p-8 ${sidebarOpen ? 'md:ml-[280px]' : 'md:ml-0'
            }`}
        >
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
      <DonateButton />
    </div>
  );
}
