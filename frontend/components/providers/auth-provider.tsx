"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk, useAuth as useClerkAuth } from "@clerk/nextjs";
import { setTokenGetter, type AppUser, type AppUserRole } from "@/lib/api";

interface AuthContextValue {
  isAuthenticated: boolean;
  isReady: boolean;
  user: AppUser | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const { getToken } = useClerkAuth();
  const router = useRouter();

  // Wire Clerk's getToken into our API layer
  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);

  const user = useMemo<AppUser | null>(() => {
    if (!clerkUser) return null;

    return {
      id: clerkUser.id,
      clerkId: clerkUser.id,
      name: clerkUser.fullName || clerkUser.username || "User",
      firstName: clerkUser.firstName ?? undefined,
      lastName: clerkUser.lastName ?? undefined,
      email: clerkUser.primaryEmailAddress?.emailAddress || "",
      role: ((clerkUser.publicMetadata?.role as AppUserRole) || "volunteer"),
      isActive: true,
    };
  }, [clerkUser]);

  const signOut = async () => {
    try {
      await clerkSignOut();
      router.replace("/");
    } catch (error) {
      console.error("Sign out error:", error);
      router.replace("/");
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!clerkUser,
      isReady: isLoaded,
      user,
      signOut,
    }),
    [clerkUser, isLoaded, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
