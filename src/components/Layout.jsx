import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatBubble from './ChatBubble';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-h-screen">
        <header
          className="sticky top-0 z-20 px-4 py-4"
          style={{
            background: 'rgba(0, 20, 10, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <Menu size={20} className="text-white" />
          </button>
        </header>

        <main className="px-4 pb-20 max-w-2xl mx-auto pt-2">
          {children}
        </main>
      </div>

      <ChatBubble />
    </div>
  );
}
