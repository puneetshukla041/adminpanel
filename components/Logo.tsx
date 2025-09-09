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
          color: transparent;
          background: linear-gradient(
            90deg,
            #9ca3af 0%,
            #e5e7eb 25%,
            #ffffff 50%,
            #e5e7eb 75%,
            #9ca3af 100%
          );
          background-size: 200% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.15);
          animation: premium-shine-animation 4s linear infinite;
        }

        @keyframes premium-shine-animation {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

     

        {showText && (
          <div className="flex space-x-1 items-center">
            <span className="tracking-tight premium-shiny-text">SSI</span>
            <span className="tracking-tight premium-shiny-text">Studios</span>
          </div>
        )}
      
    </>
  )
}
