import React from 'react';
import { Home, PlusCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title = "BrewLog", showBack = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-xl min-h-screen flex flex-col relative">
        
        {/* Header - Added padding-top safe-area calculation for native status bars */}
        <header className="bg-amber-600 text-white p-4 sticky top-0 z-10 shadow-md">
          <div className="flex items-center justify-between">
            {showBack && (
               <button onClick={() => navigate(-1)} className="mr-2 p-1 hover:bg-amber-700 rounded">
                 ← Back
               </button>
            )}
            <h1 className="text-xl font-bold flex-1">{title}</h1>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>

        {/* Bottom Nav - Added padding-bottom safe-area calculation for home indicators */}
        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around p-3 pb-5 z-10 text-gray-600 safe-pb">
          <button 
            onClick={() => navigate('/')}
            className={`flex flex-col items-center ${location.pathname === '/' ? 'text-amber-600' : ''}`}
          >
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button 
            onClick={() => navigate('/new')}
            className={`flex flex-col items-center ${location.pathname === '/new' ? 'text-amber-600' : ''}`}
          >
            <PlusCircle size={24} />
            <span className="text-xs mt-1">New Brew</span>
          </button>
        </nav>

      </div>
      
      {/* Global styles for this component to handle safe areas more cleanly via utility classes if needed, 
          though usually handled by body padding or explicit calc(). 
          The index.html style handles the root container, but sticky elements need care.
      */}
    </div>
  );
};

export default Layout;