"use client";

import { signIn } from "next-auth/react";
import { X, Mail, ArrowRight, Lock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isLogin) {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        window.location.href = "/dashboard";
      }
    } else {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Registration failed");
          setIsLoading(false);
          return;
        }

        // Auto login after successful registration
        const loginRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (loginRes?.error) {
          toast.error("Account created, but automatic login failed.");
        } else {
          window.location.href = "/dashboard";
        }

      } catch (err) {
        toast.error("Something went wrong");
      }
    }
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white dark:bg-zinc-950 p-10 border-l border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-y-auto"
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors">
              <X size={20} className="text-slate-500" />
            </button>

            <div className="mt-12 flex-1 flex flex-col justify-center">
              <h2 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-white">
                {isLogin ? "Welcome back." : "Create account."}
              </h2>
              <p className="mt-2 text-slate-500">
                {isLogin ? "Sign in to track your progress." : "Join to build powerful habits."}
              </p>

              <div className="mt-8 space-y-6">
                {/* Google Login - Primary OAuth */}
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white text-white dark:text-black rounded-2xl font-bold transition-all shadow-lg active:scale-95"
                >
                  <img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
                  Continue with Google
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-zinc-800"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-zinc-950 px-2 text-slate-400 font-medium">Or continue with email</span></div>
                </div>

                {/* Email/Password Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="Full Name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-slate-900 dark:text-white"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      placeholder="name@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      placeholder="Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    disabled={isLoading}
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-4 border border-transparent bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold transition-all text-white shadow-lg shadow-indigo-500/30 active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
                    {!isLoading && <ArrowRight size={18} />}
                  </button>
                </form>

                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                  </button>
                </div>
              </div>

              <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed px-6">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}