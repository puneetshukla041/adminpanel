"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Layout, ChevronDown, Settings, Users, FolderOpen } from 'lucide-react';
import Image from 'next/image';

// Import your actual Logo component
import Logo from '@/components/Logo';

// --- Menu Data (Updated) ---
type MenuItem = {
  name: string;
  icon: React.ElementType;
  path?: string;
  children?: { name: string; path: string }[];
  onClick?: () => void;
};

const menu: MenuItem[] = [
  { name: 'Dashboard', icon: Home, path: '/' },
  { name: 'Database', icon: FolderOpen, path: '/managedatabase' },
  {
    name: 'Content',
    icon: Layout,
    children: [
      { name: 'Blogs', path: '/blogs' },
      { name: 'Media', path: '/media' },
    ],
  },
  { name: 'Users', icon: Users, path: '/users' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

// --- Sidebar Component ---
type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  // Expand parent menus based on URL
  useEffect(() => {
    const expandedParents = menu
      .filter(
        (item) =>
          item.children && item.children.some((child) => pathname.startsWith(child.path))
      )
      .map((item) => item.name);
    setExpanded(expandedParents);
  }, [pathname]);

  const toggle = (name: string) => {
    setExpanded((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const isParentActive = (item: MenuItem) => {
    if (item.path && pathname.startsWith(item.path)) return true;
    if (item.children) return item.children.some((c) => pathname.startsWith(c.path));
    return false;
  };

  const isChildActive = (path: string) => pathname.startsWith(path);

  // Placeholder logout function
  const handleLogout = useCallback(() => {
    // In a real application, you would handle token removal and API calls here.
    console.log("Logging out...");
    router.push('/login');
  }, [router]);

  const renderSidebarContent = (isMobile: boolean, isDesktopHovered = false) => (
    <aside
      className={`fixed top-0 bottom-0 bg-[#111214] text-white flex flex-col font-nunito border-r-2 border-white/5 shadow-xl transition-all duration-300 ease-in-out
        ${isMobile ? 'w-[85%] max-w-sm' : isDesktopHovered ? 'w-64' : 'w-20'}
      `}
      aria-label="Sidebar navigation"
    >
      <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
        {/* Logo Section */}
        <div className="p-5 h-[72px] border-b border-gray-800/50 flex items-center justify-center overflow-hidden">
          {isMobile || isDesktopHovered ? (
            <motion.div
              initial={{ opacity: 100, scale: 0.95 }}
              animate={{ opacity: 100, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <Image
                src="/images/ssilogo.png"
                alt="SSI Logo"
                width={37}
                height={37}
                className="object-contain"
              />
              <Logo />
            </motion.div>
          ) : (
            <Image
              src="/images/ssilogo.png"
              alt="SSI Logo"
              width={37}
              height={37}
              className="object-contain"
            />
          )}
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1.5">
          <LayoutGroup>
            {menu.map((item) => {
              const Icon = item.icon;
              const isOpenMenuItem = expanded.includes(item.name);
              const active = isParentActive(item);

              return (
                <div key={item.name}>
                  <motion.button
                    onClick={() => {
                      if (item.children) toggle(item.name);
                      else if (item.path && item.path !== pathname) {
                        router.push(item.path);
                        if (isMobile) toggleSidebar();
                      }
                    }}
                    className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 relative
                      ${active ? 'text-white font-medium bg-white/10' : 'text-gray-400 hover:text-white'}
                      hover:bg-white/10 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/20
                      ${!isMobile && !isDesktopHovered && 'justify-center'}
                      cursor-pointer
                    `}
                    type="button"
                    aria-expanded={item.children ? isOpenMenuItem : undefined}
                    aria-controls={item.children ? `submenu-${item.name}` : undefined}
                    layout
                  >
                    <div className="relative flex items-center gap-3 overflow-hidden">
                      <Icon
                        size={20}
                        className={`transition-colors flex-shrink-0 ${
                          active ? 'text-white' : 'text-gray-400 group-hover:text-cyan-400'
                        }`}
                      />
                      <AnimatePresence>
                        {(isMobile || isDesktopHovered) && (
                          <motion.span
                            className="text-sm whitespace-nowrap"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <div
                      className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-opacity duration-300 ${
                        active ? 'opacity-100 bg-cyan-400 shadow-cyan' : 'opacity-0'
                      }`}
                    />

                    {item.children &&
                      (isMobile || isDesktopHovered) && (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={isOpenMenuItem ? 'open' : 'closed'}
                            initial={{ rotate: isOpenMenuItem ? -90 : 0 }}
                            animate={{ rotate: isOpenMenuItem ? 0 : -90 }}
                            transition={{ duration: 0.2 }}
                            className="text-gray-500 group-hover:text-gray-300 transition-transform flex-shrink-0"
                          >
                            <ChevronDown size={16} />
                          </motion.div>
                        </AnimatePresence>
                      )}
                  </motion.button>

                  {item.children && (
                    <AnimatePresence>
                      {isOpenMenuItem && (isMobile || isDesktopHovered) && (
                        <motion.div
                          id={`submenu-${item.name}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, type: 'tween' }}
                          className="ml-5 border-l border-gray-700 pl-4 overflow-hidden"
                        >
                          {item.children.map((child) => {
                            const childIsActive = isChildActive(child.path);
                            return (
                              <button
                                key={child.path}
                                onClick={() => {
                                  if (child.path !== pathname) {
                                    router.push(child.path);
                                    if (isMobile) toggleSidebar();
                                  }
                                }}
                                className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 mt-1
                                  ${childIsActive ? 'text-white font-medium bg-white/10' : 'text-gray-400 hover:text-white'}
                                  hover:bg-white/10 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/20
                                  cursor-pointer
                                `}
                                type="button"
                              >
                                {child.name}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </LayoutGroup>
        </nav>

        {/* --- Sidebar Footer (New) --- */}
        <div className={`mt-auto p-4 flex-shrink-0 ${!isMobile && !isDesktopHovered ? 'hidden' : 'flex'} flex-col items-center justify-center`}>
          {/* Download Android App Button */}
          <a
            href="https://drive.google.com/file/d/1AgSWuLtwlhmCxMTsDuHLxvmA8MuKDbTL/view?usp=sharing" // Replace with your actual link
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mb-3 flex items-center justify-center gap-2 rounded-lg 
                      bg-gradient-to-r from-green-600 via-green-700 to-green-800 
                      hover:from-green-500 hover:via-green-600 hover:to-green-700
                      text-white font-medium text-sm py-2.5 
                      shadow-md shadow-black/30 backdrop-blur-md
                      transition-all cursor-pointer active:scale-[0.97]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8Zm-1-13h2v6h-2Zm0 8h2v2h-2Z"/>
            </svg>
            Download Android App
          </a>

          {/* Download Desktop App Button */}
          <a
            href="https://drive.google.com/uc?export=download&id=1wsR2aYD_iW_dFCKuP-f2IwOusziUHQiK"
            download
            className="w-full mb-3 flex items-center justify-center gap-2 rounded-lg 
                      bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 
                      hover:from-gray-600 hover:via-gray-700 hover:to-gray-800
                      text-gray-200 font-medium text-sm py-2.5 
                      shadow-md shadow-black/30 backdrop-blur-md
                      transition-all cursor-pointer active:scale-[0.97]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
              />
            </svg>
            Download Desktop App
          </a>

          <div className="text-gray-500 text-xs text-center select-none">
            SSI CRS ADMINS v.1.08.25
          </div>
          <div className="text-green-500 text-xs text-center select-none">
            Beta Version
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-400 transition-colors w-full py-2 rounded-lg hover:bg-red-500/10 cursor-pointer mt-3"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className="hidden lg:block fixed top-0 left-0 bottom-0 z-30"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {renderSidebarContent(false, isHovered)}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
            aria-hidden={!isOpen}
          >
            <div className="absolute inset-0 bg-black/60" onClick={toggleSidebar} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 250, damping: 35 }}
              className="relative w-[85%] max-w-sm h-full"
            >
              {renderSidebarContent(true)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .font-nunito {
          font-family: 'Nunito', sans-serif;
        }
        .shadow-cyan {
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.6);
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #1e1e1e;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #3b3b3b;
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #555;
        }
      `}</style>
    </>
  );
}
