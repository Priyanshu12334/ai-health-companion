import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Droplets, Moon, Smile, MessageCircle, BarChart3, Settings, HeartPulse, Menu, FileText, Apple } from 'lucide-react';

const Layout = () => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location?.pathname || '';
  const isMoreActive = ['/mood', '/analytics', '/medical-reports', '/settings', '/nutrition'].includes(currentPath);

  const closeMoreMenu = () => setIsMoreMenuOpen(false);

  return (
    <>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-68 bg-sky-600 shadow-lg m-4 rounded-2xl p-6 h-[calc(100vh-2rem)] shrink-0 z-10 border-0">
          <div className="flex items-center gap-2.5 mb-8 text-white px-2">
            <HeartPulse className="w-6 h-6 shrink-0" />
            <h1 className="text-xl font-bold tracking-tight">Wellora</h1>
          </div>
          
          <nav className="flex-1 space-y-1.5">
            <NavItem to="/dashboard" icon={<Home />} label="Dashboard" />
            <NavItem to="/hydration" icon={<Droplets />} label="Hydration" />
            <NavItem to="/sleep" icon={<Moon />} label="Sleep" />
            <NavItem to="/mood" icon={<Smile />} label="Mood" />
            <NavItem to="/nutrition" icon={<Apple />} label="Nutrition Coach" />
            <NavItem to="/ai-chat" icon={<MessageCircle />} label="AI Health Assistant" />
            <NavItem to="/analytics" icon={<BarChart3 />} label="Health Analytics" />
            <NavItem to="/medical-reports" icon={<FileText />} label="Medical Report Simplifier" />
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
                to="/nutrition" 
                icon={<Apple />} 
                label="Nutrition Coach" 
                onClick={closeMoreMenu} 
                isActive={currentPath === '/nutrition'} 
              />
              <SimpleMoreMenuItem 
                to="/analytics" 
                icon={<BarChart3 />} 
                label="Health Analytics" 
                onClick={closeMoreMenu} 
                isActive={currentPath === '/analytics'} 
              />
              <SimpleMoreMenuItem 
                to="/medical-reports" 
                icon={<FileText />} 
                label="Medical Report Simplifier" 
                onClick={closeMoreMenu} 
                isActive={currentPath === '/medical-reports'} 
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
      `flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-200 active:scale-[0.98] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none ${
        isActive 
          ? 'bg-sky-700/90 text-white font-bold shadow-md' 
          : 'text-white/90 hover:bg-sky-700/70 hover:text-white hover:shadow-sm'
      }`
    }
  >
    {icon && React.isValidElement(icon) ? React.cloneElement(icon, { className: 'w-[18px] h-[18px]' }) : null}
    <span className="text-sm font-medium">{label || ''}</span>
  </NavLink>
);

const MobileNavItem = ({ to, icon, label, isCenter, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center p-2 transition-all duration-200 active:scale-95 ${
        isActive ? 'text-sky-600 dark:text-sky-400 font-semibold transform -translate-y-0.5' : 'text-text-secondary hover:text-sky-600'
      } ${isCenter ? '-mt-6' : ''}`
    }
  >
    <div className={`${isCenter ? 'p-4 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-lg shadow-sky-600/30 border-4 border-background transition-all duration-200 active:scale-95' : ''}`}>
      {icon && React.isValidElement(icon) ? React.cloneElement(icon, { className: isCenter ? 'w-6 h-6' : 'w-5 h-5 mb-1' }) : null}
    </div>
    {!isCenter && <span className="text-[10px] font-medium mt-1">{label || ''}</span>}
  </NavLink>
);

const SimpleMoreMenuItem = ({ to, icon, label, onClick, isActive }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] ${
      isActive 
        ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 font-semibold' 
        : 'text-text-secondary hover:bg-surface hover:text-sky-600'
    }`}
  >
    <div className={`p-1.5 rounded-lg transition-colors duration-200 ${isActive ? 'bg-sky-600 text-white' : 'bg-surface text-text-secondary'}`}>
      {icon && React.isValidElement(icon) ? React.cloneElement(icon, { className: 'w-4 h-4' }) : null}
    </div>
    <span className="text-sm">{label || ''}</span>
  </Link>
);

export default Layout;
