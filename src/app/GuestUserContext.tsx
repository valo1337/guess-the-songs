"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GuestUser {
  isGuest: true;
  username: string;
}

interface RegisteredUser {
  isGuest: false;
}

type UserType = GuestUser | RegisteredUser | null;

interface GuestUserContextType {
  user: UserType;
  setGuestUser: () => void;
  clearUser: () => void;
}

const GuestUserContext = createContext<GuestUserContextType | undefined>(undefined);

export function GuestUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType>(null);

  function setGuestUser() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setUser({ isGuest: true, username: `Guest${randomNum}` });
  }

  function clearUser() {
    setUser(null);
  }

  return (
    <GuestUserContext.Provider value={{ user, setGuestUser, clearUser }}>
      {children}
    </GuestUserContext.Provider>
  );
}

export function useGuestUser() {
  const context = useContext(GuestUserContext);
  if (!context) throw new Error('useGuestUser must be used within GuestUserProvider');
  return context;
} 