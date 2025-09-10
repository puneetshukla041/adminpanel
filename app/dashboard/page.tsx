"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import your components to avoid SSR issues
const DashboardPage = dynamic(() => import("@/components/DashboardPage"), { ssr: false });
const MobileDashboard = dynamic(() => import("@/components/mobiledashboard"), { ssr: false });

export default function DashboardWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to detect screen width
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust 768px breakpoint as needed
    };

    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize); // Update on resize
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <MobileDashboard /> : <DashboardPage />;
}
