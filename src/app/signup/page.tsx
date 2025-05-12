"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setLoading(false);

      console.log('Signup response:', { status: res.status, data });

      if (!res.ok) {
        // More detailed error handling
        const errorMessage = data.details 
          ? JSON.stringify(data.details) 
          : (data.error || "Signup failed");
        setError(errorMessage);
      } else {
        setSuccess("Signup successful! Redirecting to login...");
        setTimeout(() => router.push("/login"), 1500);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setLoading(false);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold mb-4 text-center">Sign Up</h1>
        <input
          name="name"
          type="text"
          placeholder="Name (optional)"
          value={form.name}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
        />
        <input
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
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
        {error && <div className="text-red-400 text-center break-words">{error}</div>}
        {success && <div className="text-green-400 text-center">{success}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-yellow-300 text-black font-semibold text-xl hover:bg-yellow-400 transition-colors shadow-lg disabled:opacity-60"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <div className="text-center text-gray-400 mt-2">
          Already have an account?{' '}
          <a href="/login" className="text-yellow-300 hover:underline">Log in</a>
        </div>
      </form>
    </div>
  );
} 