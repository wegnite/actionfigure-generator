"use client";

import { SessionProvider } from "next-auth/react";
import { isAuthEnabled } from "@/lib/auth";

export function NextAuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 始终提供 SessionProvider 上下文，避免 useSession hook 报错
  // 即使认证功能禁用，SessionProvider 也会正常工作并返回空会话
  return <SessionProvider>{children}</SessionProvider>;
}
