"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGuestUser } from '../GuestUserContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setGuestUser } = useGuestUser();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "Invalid credentials" : res.error);
    } else {
      router.push("/");
    }
  };

  // Show error from NextAuth redirect
  const urlError = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold mb-4 text-center">Log In</h1>
        <input
          name="email"
          type="text"
          placeholder="Email or Username"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
        />
        {(error || urlError) && <div className="text-red-400 text-center">{error || urlError}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-yellow-300 text-black font-semibold text-xl hover:bg-yellow-400 transition-colors shadow-lg disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
        <button
          type="button"
          onClick={() => { setGuestUser(); router.push('/'); }}
          className="w-full py-3 rounded-full border-2 border-yellow-300 text-yellow-300 font-semibold text-xl hover:bg-yellow-400 hover:text-black transition-colors shadow-lg mt-2"
        >
          Continue as Guest
        </button>
        <div className="text-center text-gray-400 mt-2">
          Don't have an account?{' '}
          <a href="/signup" className="text-yellow-300 hover:underline">Sign up</a>
        </div>
      </form>
    </div>
  );
} 