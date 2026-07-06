import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  HardHat, 
  ClipboardCheck, 
  Users,
  Briefcase,
  Menu, 
  X,
  LogOut,
  Settings,
  DoorOpen,
  Lock
} from 'lucide-react';
import { useApp } from '../AppContext';
import { cn } from '../lib/utils';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { companyData, signOut } = useApp();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Building2, label: 'Construtoras', path: '/construtoras' },
    { icon: HardHat, label: 'Obras', path: '/obras' },
    { icon: Briefcase, label: 'Terceirizadas', path: '/terceirizadas' },
    { icon: Users, label: 'Funcionários', path: '/funcionarios' },
    { icon: ClipboardCheck, label: 'Vistorias', path: '/vistorias' },
    { icon: DoorOpen, label: 'Portaria', path: '/portaria' },
    { icon: Settings, label: 'Dados da Empresa', path: '/configuracoes' },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out w-64",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex flex-col h-full">
          {/* Logo Section */}
          <div className="mb-10 flex flex-col items-center">
            {companyData.logoUrl ? (
              <img 
                src={companyData.logoUrl} 
                alt="Logo" 
                className="h-16 w-auto object-contain mb-2"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-16 w-16 bg-gray-100 rounded-xl flex items-center justify-center mb-2 border border-gray-200">
                <Lock className="text-gray-400" size={32} />
              </div>
            )}
            <h1 className="font-semibold text-gray-900 text-center">{companyData.name}</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive 
                      ? "bg-brand text-white" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Info */}
          <div className="mt-auto pt-6 border-t border-gray-100 space-y-4">
            <button
              onClick={() => {
                signOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut size={20} />
              <span className="font-medium">Sair do Sistema</span>
            </button>
            <p className="text-xs text-gray-400 text-center">
              SYS - Sistemas Web
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
