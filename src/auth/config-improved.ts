import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";
import { Provider } from "next-auth/providers/index";
import { User } from "@/types/user";
import { getClientIp } from "@/lib/ip";
import { getIsoTimestr } from "@/lib/time";
import { getUuid } from "@/lib/hash";
import { saveUser } from "@/services/user";
import { handleSignInUser } from "./handler";

let providers: Provider[] = [];

// Google One Tap Auth
if (
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED === "true" &&
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID
) {
  providers.push(
    CredentialsProvider({
      id: "google-one-tap",
      name: "google-one-tap",

      credentials: {
        credential: { type: "text" },
      },

      async authorize(credentials, req) {
        const googleClientId = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID;
        if (!googleClientId) {
          console.log("invalid google auth config");
          return null;
        }

        const token = credentials!.credential;

        try {
          // 添加超时控制和错误处理
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

          const response = await fetch(
            "https://oauth2.googleapis.com/tokeninfo?id_token=" + token,
            {
              signal: controller.signal,
              headers: {
                'User-Agent': 'NextAuth.js'
              }
            }
          );

          clearTimeout(timeoutId);

          if (!response.ok) {
            console.log("Failed to verify token:", response.status, response.statusText);
            return null;
          }

          const payload = await response.json();
          if (!payload) {
            console.log("invalid payload from token");
            return null;
          }

          const {
            email,
            sub,
            given_name,
            family_name,
            email_verified,
            picture: image,
          } = payload;
          if (!email) {
            console.log("invalid email in payload");
            return null;
          }

          const user = {
            id: sub,
            name: [given_name, family_name].join(" "),
            email,
            image,
            emailVerified: email_verified ? new Date() : null,
          };

          return user;
        } catch (error) {
          if (error.name === 'AbortError') {
            console.error("Google token verification timeout");
          } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            console.error("Network error accessing Google services:", error.message);
          } else {
            console.error("Google One-Tap auth error:", error);
          }
          return null;
        }
      },
    })
  );
}

// Google Auth with improved error handling
if (
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" &&
  process.env.AUTH_GOOGLE_ID &&
  process.env.AUTH_GOOGLE_SECRET
) {
  providers.push(
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // 添加额外的配置来处理网络问题
      httpOptions: {
        timeout: 10000, // 10秒超时
      },
      // 添加自定义的授权URL检查
      checks: ["state"],
    })
  );
}

// Github Auth
if (
  process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" &&
  process.env.AUTH_GITHUB_ID &&
  process.env.AUTH_GITHUB_SECRET
) {
  providers.push(
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  );
}

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "google-one-tap");

export const authOptions: NextAuthConfig = {
  providers,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error", // 添加错误页面
  },
  // 添加调试模式
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        const isAllowedToSignIn = true;
        if (isAllowedToSignIn) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token, user }) {
      if (token && token.user && token.user) {
        session.user = token.user;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      try {
        if (!user || !account) {
          return token;
        }

        const userInfo = await handleSignInUser(user, account);
        if (!userInfo) {
          throw new Error("save user failed");
        }

        token.user = {
          uuid: userInfo.uuid,
          email: userInfo.email,
          nickname: userInfo.nickname,
          avatar_url: userInfo.avatar_url,
          created_at: userInfo.created_at,
        };

        return token;
      } catch (e) {
        console.error("jwt callback error:", e);
        return token;
      }
    },
  },
  // 添加事件处理来记录网络问题
  events: {
    async signIn(message) {
      console.log("User signed in:", message.user?.email);
    },
    async signOut(message) {
      console.log("User signed out:", message.token);
    },
    async session(message) {
      // 可以在这里添加会话监控
    },
  },
};