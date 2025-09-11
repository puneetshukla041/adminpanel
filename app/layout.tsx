'use client';

import "@/app/globals.css";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const pathname = usePathname();

  // Pages where we don't want the sidebar
  const hideSidebar = pathname === "/login" || pathname === "/register";

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="flex min-h-screen text-gray-800 bg-gray-100 overflow-x-hidden">
        {/* Sidebar only on non-auth pages */}
        {!hideSidebar && (
          <>
            <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
            <button
              onClick={toggleSidebar}
              className="fixed top-4 left-4 z-[999] p-2 text-xl md:hidden rounded-full shadow-lg bg-gray-900 text-white"
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
          </>
        )}

        {/* Main Content */}
        <div
          className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
            !hideSidebar ? "ml-0 lg:ml-20" : ""
          }`}
        >
          <main
            className={`flex-1 ${
              hideSidebar ? "flex items-center justify-center" : ""
            } p-0 sm:p-6 md:p-0`}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
