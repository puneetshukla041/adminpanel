'use client';

import "@/app/globals.css";
import { useState } from "react";
import Sidebar from "@/components/Sidebar"; // ✅ import Sidebar
 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <html lang="en">
      <body className="flex min-h-screen text-gray-800 bg-gray-100">
        {/* Sidebar */}
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-h-screen transition-all duration-300 ml-0 lg:ml-20">
          {/* Toggle button for small screens */}
          <button
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-[999] p-2 text-xl md:hidden rounded-full shadow-lg bg-gray-900 text-white"
          >
            {/* You can add a menu icon here (FaBars or Lucide Menu) */}
            ☰
          </button>

          {/* Page content */}
          <main className="flex-1 p-6 md:p-8">{children}</main>

 
        </div>
      </body>
    </html>
  );
}
