import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";
import { Provider } from "next-auth/providers/index";
import { User } from "@/types/user";

// Optional: honor HTTPS_PROXY for server-side Google requests (helps in restricted networks)
try {
  const httpsProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (httpsProxy) {
    // undici is the HTTP client used by Next.js/Node 18+
    // Dynamically require to avoid bundling on client
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ProxyAgent, setGlobalDispatcher } = require('undici');
    setGlobalDispatcher(new ProxyAgent(httpsProxy));
    console.log('[auth] Using proxy for outgoing requests:', httpsProxy);
  }
} catch (e) {
  // noop: proxy is optional
}
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

        const response = await fetch(
          "https://oauth2.googleapis.com/tokeninfo?id_token=" + token
        );
        if (!response.ok) {
          console.log("Failed to verify token");
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
      },
    })
  );
}

// Google Auth
if (
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" &&
  process.env.AUTH_GOOGLE_ID &&
  process.env.AUTH_GOOGLE_SECRET
) {
  providers.push(
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // 明确指定端点以避免运行时对 well-known 的网络发现请求
      authorization: {
        url: 'https://accounts.google.com/o/oauth2/v2/auth',
        params: {
          // 避免每次强制 consent 触发 Google 风险校验 (rapt)
          prompt: 'select_account',
        },
      },
      token: 'https://oauth2.googleapis.com/token',
      userinfo: 'https://openidconnect.googleapis.com/v1/userinfo',
      // 可选：减少外部请求超时导致的失败面
      httpOptions: {
        timeout: 15000,
      },
      // checks: ['pkce', 'state'], // 如需显式指定
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
  debug: process.env.NODE_ENV !== 'production',
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const isAllowedToSignIn = true;
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
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

        // 设定一个上限超时，避免外部网络导致登录卡住
        const withTimeout = <T>(p: Promise<T>, ms = 2500) =>
          Promise.race([
            p,
            new Promise<T>((_, reject) => setTimeout(() => reject(new Error('handleSignInUser timeout')), ms))
          ]);

        try {
          const userInfo = await withTimeout(handleSignInUser(user, account));
          if (userInfo) {
            token.user = {
              uuid: userInfo.uuid,
              email: userInfo.email,
              nickname: userInfo.nickname,
              avatar_url: userInfo.avatar_url,
              created_at: userInfo.created_at,
            };
          }
        } catch (innerErr) {
          console.warn('[auth] handleSignInUser skipped:', (innerErr as Error).message);
          // 最少填充基础字段，后续可在用户使用时再延迟写库
          token.user = {
            uuid: getUuid(),
            email: user.email!,
            nickname: user.name || '',
            avatar_url: user.image || '',
            created_at: new Date(),
          } as any;
        }

        return token;
      } catch (e) {
        console.error("jwt callback error:", e);
        return token;
      }
    },
  },
};
