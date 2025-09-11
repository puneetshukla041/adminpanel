"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check auth status and screen size on mount
  useEffect(() => {
    // Check if the user is already authenticated
    const checkAuthStatus = async () => {
      const authed = await isAuthenticated();
      if (authed) {
        router.push("/dashboard");
      }
    };
    checkAuthStatus();

    // Check for mobile screen size on initial load and resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's 'md' breakpoint is a good reference
    };
    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router]);

  const capitalize = (s: string) =>
    typeof s === "string" ? s.charAt(0).toUpperCase() + s.slice(1) : "";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      setTimeout(() => {
        setIsLoading(false);
        setShowWelcome(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }, 1500);
    } else {
      setIsLoading(false);
      setShowWelcome(false);
      setError("Invalid username or password");
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center relative overflow-hidden m-0 p-0">
      {/* Background Video (only on non-mobile devices for performance) */}
      {!isMobile && (
        <video
          src="/videos/AuthBg.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Loader Overlay */}
      {isLoading && !showWelcome && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="text-center animate-scale-in">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-sm tracking-wide">
              Verifying credentials...
            </p>
          </div>
        </div>
      )}

      {/* Welcome Overlay */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
          <div
            className="text-white text-4xl font-extrabold tracking-wide animate-scale-in"
            style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.5px" }}
          >
            Welcome,{" "}
            <span className="text-blue-300">{capitalize(username)}</span>
          </div>
        </div>
      )}

      {/* Login Box */}
      <div
        className="relative z-10 w-full max-w-sm rounded-xl shadow-lg p-8
                           bg-white/90 md:bg-gray-800/40 md:backdrop-blur-md
                           border border-gray-200 md:border-gray-700/50
                           md:text-gray-100"
      >
        <h1 className="text-2xl font-semibold text-gray-900 md:text-gray-100 mb-2 text-center">
          SSI CRS Admin
        </h1>
        <p className="text-gray-500 md:text-gray-300 text-sm text-center mb-6">
          Please log in to continue
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 md:text-gray-300">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2
                                 text-gray-900 md:text-white
                                 focus:outline-none focus:ring-2 focus:ring-black md:focus:ring-blue-300
                                 bg-white md:bg-gray-900/30 md:border-gray-700/50"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading || showWelcome}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 md:text-gray-300">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2
                                 text-gray-900 md:text-white
                                 focus:outline-none focus:ring-2 focus:ring-black md:focus:ring-blue-300
                                 bg-white md:bg-gray-900/30 md:border-gray-700/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading || showWelcome}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 md:bg-gray-800/40 md:border md:border-gray-700/50 md:hover:bg-gray-700/50 md:shadow-inner"
            disabled={isLoading || showWelcome}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
