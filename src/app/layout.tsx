import type { Metadata } from "next";
import { GeistSans, GeistMono } from 'geist/font';
import "./globals.css";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { headers } from "next/headers";
import { SessionProvider } from 'next-auth/react';
import SessionProviderWrapper from './SessionProviderWrapper';
import { GuestUserProvider } from './GuestUserContext';

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: "Music Police",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // SSR session fetch for layout
  const session = await getServerSession();
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <title>Music Police</title>
      </head>
      <body className={`${geistSans.className} antialiased`}>
        <GuestUserProvider>
          <SessionProviderWrapper>
            <header style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: '1.5rem 0 1rem 0', position: 'relative' }}>
              <a href="/" style={{ display: 'flex', alignItems: 'center', marginLeft: 32 }}>
                <img src="/logo.png" alt="Music Police Logo" style={{ height: 48 }} />
              </a>
              <div style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)' }}>
                {session?.user ? (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <a href="/profile" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                      {session.user.image ? (
                        <img src={session.user.image} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', marginRight: 12 }} />
                      ) : (
                        <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#facc15', color: '#232834', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, marginRight: 12 }}>
                          {session.user.name ? session.user.name[0].toUpperCase() : (session.user.email ? session.user.email[0].toUpperCase() : '?')}
                        </span>
                      )}
                      <span className="mr-4 text-yellow-200 font-semibold">{session.user.name || session.user.email}</span>
                    </a>
                  </div>
                ) : (
                  <Link href="/login" className="bg-yellow-300 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-400">Login / Signup</Link>
                )}
              </div>
            </header>
            {children}
          </SessionProviderWrapper>
        </GuestUserProvider>
      </body>
    </html>
  );
}
