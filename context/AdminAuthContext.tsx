"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginAdmin } from "@/api/admin";

export interface AdminSession {
  id: string | number;
  name: string;
  username: string;
  role: string;
  token?: string; 
}

interface AuthCtx {
  user: AdminSession | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const sessionKey = "admin_session"; 

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(sessionKey);
      if (raw) setUser(JSON.parse(raw) as AdminSession);
    } catch {
      /* no session */
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const u = username.trim();
    const p = password.trim();
    
    if (!u || !p) return "نام کاربری و رمز عبور را وارد کنید.";

    try {
      const data = await loginAdmin(u, p);
      
      const session: AdminSession = {
        id: data.admin?.id || data.user?.id || 1,
        name: data.admin?.name || data.user?.name || "مدیر",
        username: u,
        role: data.admin?.role || data.user?.role || "admin",
        token: data.token,
      };

      setUser(session);
      localStorage.setItem(sessionKey, JSON.stringify(session));
      
      return null;
    } catch (error: any) {
      return error.message || "نام کاربری یا رمز عبور اشتباه است.";
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(sessionKey);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}