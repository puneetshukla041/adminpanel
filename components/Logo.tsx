'use client'

import Image from 'next/image'

type LogoProps = {
  showText?: boolean
}

export default function Logo({ showText = true }: LogoProps) {
  return (
    <>
      <style>{`
        .premium-shiny-text {
          position: relative;
          font-weight: 800;
          font-size: 1.15rem; /* Increased size */
          color: transparent;
          background: linear-gradient(
            90deg,
            #9ca3af 0%,
            #e5e7eb 25%,
            #ffffff 50%,
            #e5e7eb 75%,
            #9ca3af 100%
          );
          background-size: 300% 100%; /* Larger background for smoother shine */
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
          animation: premium-shine-animation 3s ease-in-out infinite;
        }

        @keyframes premium-shine-animation {
          0% { background-position: 200% center; }
          50% { background-position: -50% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {showText && (
        <div className="flex space-x-2 items-center">
          <span className="tracking-tight premium-shiny-text">CRS</span>
          <span className="tracking-tight premium-shiny-text">ADMIN</span>
        </div>
      )}
    </>
  )
}
