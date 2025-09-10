'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Layout, ChevronDown, Settings, Users, FolderOpen } from 'lucide-react'
import Image from 'next/image'

// Import your actual Logo component
import Logo from '@/components/Logo'

// --- Menu Data (Updated) ---
type MenuItem = {
  name: string
  icon: React.ElementType
  path?: string
  children?: { name: string; path: string }[]
  onClick?: () => void
}

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
]

// --- Sidebar Component ---
type SidebarProps = {
  isOpen: boolean
  toggleSidebar: () => void
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string[]>([])
  const [isHovered, setIsHovered] = useState(false)

  // Expand parent menus based on URL
  useEffect(() => {
    const expandedParents = menu
      .filter(
        (item) =>
          item.children && item.children.some((child) => pathname.startsWith(child.path))
      )
      .map((item) => item.name)
    setExpanded(expandedParents)
  }, [pathname])

  const toggle = (name: string) => {
    setExpanded((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const isParentActive = (item: MenuItem) => {
    if (item.path && pathname.startsWith(item.path)) return true
    if (item.children) return item.children.some((c) => pathname.startsWith(c.path))
    return false
  }

  const isChildActive = (path: string) => pathname.startsWith(path)

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
              const Icon = item.icon
              const isOpenMenuItem = expanded.includes(item.name)
              const active = isParentActive(item)

              return (
                <div key={item.name}>
                  <motion.button
                    onClick={() => {
                      if (item.children) toggle(item.name)
                      else if (item.path && item.path !== pathname) {
                        router.push(item.path)
                        if (isMobile) toggleSidebar()
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
                            const childIsActive = isChildActive(child.path)
                            return (
                              <button
                                key={child.path}
                                onClick={() => {
                                  if (child.path !== pathname) {
                                    router.push(child.path)
                                    if (isMobile) toggleSidebar()
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
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              )
            })}
          </LayoutGroup>
        </nav>
      </div>
    </aside>
  )

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
  )
}
