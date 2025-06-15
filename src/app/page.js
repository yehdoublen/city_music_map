"use client"

import { useState } from "react";
import { auth, provider } from "./config/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      console.log("Login successful:", result.user);
      router.push("/mapbox");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      setError(error.message);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-2">TuneMap</h1>
        <div className="flex justify-center items-center mb-8">
          <Image src="/logo.png" alt="logo" width={140} height={140} />
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!user && (
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-full transition-colors duration-200 flex items-center"
          >
            {loading ? (
              <span>Loading...</span>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        )}
      </div>
    </main>
  );
}