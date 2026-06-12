import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Droplets, Moon, Smile, MessageCircle, BarChart3, Settings, HeartPulse, Menu } from 'lucide-react';

const Layout = () => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location?.pathname || '';
  const isMoreActive = ['/mood', '/analytics', '/settings'].includes(currentPath);

  const closeMoreMenu = () => setIsMoreMenuOpen(false);

  return (
    <>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-sky-600 shadow-xl m-4 rounded-4xl p-6 h-[calc(100vh-2rem)] shrink-0 z-10 border-0">
          <div className="flex items-center gap-2 mb-8 text-white">
            <HeartPulse className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight">Aurora</h1>
          </div>
          
          <nav className="flex-1 space-y-2">
            <NavItem to="/dashboard" icon={<Home />} label="Dashboard" />
            <NavItem to="/hydration" icon={<Droplets />} label="Hydration" />
            <NavItem to="/sleep" icon={<Moon />} label="Sleep" />
            <NavItem to="/mood" icon={<Smile />} label="Mood" />
            <NavItem to="/ai-chat" icon={<MessageCircle />} label="AI Chat" />
            <NavItem to="/analytics" icon={<BarChart3 />} label="Analytics" />
          </nav>
          
          <div className="mt-auto">
            <NavItem to="/settings" icon={<Settings />} label="Settings" />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 relative w-full overflow-y-auto pb-20 md:pb-0 h-full">
          <div className="max-w-5xl mx-auto w-full p-4 md:p-8 min-h-full flex flex-col">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 w-full glass-card rounded-t-4xl rounded-b-none border-x-0 border-b-0 p-2 z-50 flex justify-around items-center">
          <MobileNavItem to="/dashboard" icon={<Home />} label="Home" onClick={closeMoreMenu} />
          <MobileNavItem to="/hydration" icon={<Droplets />} label="Water" onClick={closeMoreMenu} />
          <MobileNavItem to="/ai-chat" icon={<MessageCircle />} label="AI" isCenter onClick={closeMoreMenu} />
          <MobileNavItem to="/sleep" icon={<Moon />} label="Sleep" onClick={closeMoreMenu} />
          <button 
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${
              isMoreActive || isMoreMenuOpen ? 'text-sky-600 dark:text-sky-600 transform -translate-y-1' : 'text-text-secondary'
            }`}
          >
            <Menu className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium mt-1">More</span>
          </button>
        </nav>

        {/* Mobile More Menu Popup */}
        {isMoreMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40" onClick={closeMoreMenu}>
            <div 
              className="absolute bottom-20 right-4 w-48 bg-card border border-border-color shadow-lg rounded-2xl p-2 flex flex-col gap-1"
              onClick={e => e.stopPropagation()}
            >
              <SimpleMoreMenuItem 
                to="/mood" 
                icon={<Smile />} 
                label="Mood" 
                onClick={closeMoreMenu} 
                isActive={currentPath === '/mood'} 
              />
              <SimpleMoreMenuItem 
                to="/analytics" 
                icon={<BarChart3 />} 
                label="Analytics" 
                onClick={closeMoreMenu} 
                isActive={currentPath === '/analytics'} 
              />
              <SimpleMoreMenuItem 
                to="/settings" 
                icon={<Settings />} 
                label="Settings" 
                onClick={closeMoreMenu} 
                isActive={currentPath === '/settings'} 
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        isActive 
          ? 'bg-sky-700 text-white shadow-md shadow-sky-900/20' 
          : 'text-white hover:bg-white/10'
      }`
    }
  >
    {icon && React.isValidElement(icon) ? React.cloneElement(icon, { className: 'w-5 h-5' }) : null}
    <span className="font-medium">{label || ''}</span>
  </NavLink>
);

const MobileNavItem = ({ to, icon, label, isCenter, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center p-2 transition-all duration-300 ${
        isActive ? 'text-sky-600 dark:text-sky-600 transform -translate-y-1' : 'text-text-secondary'
      } ${isCenter ? '-mt-6' : ''}`
    }
  >
    <div className={`${isCenter ? 'p-4 bg-sky-500 text-white rounded-full shadow-lg shadow-sky-500/40 border-4 border-background ' : ''}`}>
      {icon && React.isValidElement(icon) ? React.cloneElement(icon, { className: isCenter ? 'w-6 h-6' : 'w-5 h-5 mb-1' }) : null}
    </div>
    {!isCenter && <span className="text-[10px] font-medium mt-1">{label || ''}</span>}
  </NavLink>
);

const SimpleMoreMenuItem = ({ to, icon, label, onClick, isActive }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
      isActive 
        ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400 font-medium' 
        : 'text-text-secondary hover:bg-surface'
    }`}
  >
    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-sky-500 text-white' : 'bg-surface text-text-secondary'}`}>
      {icon && React.isValidElement(icon) ? React.cloneElement(icon, { className: 'w-4 h-4' }) : null}
    </div>
    <span className="text-sm">{label || ''}</span>
  </Link>
);

export default Layout;
