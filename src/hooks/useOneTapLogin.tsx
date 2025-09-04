"use client";

import googleOneTap from "google-one-tap";
import { signIn } from "next-auth/react";
import { useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

const useOneTapLogin = function () {
  const { data: session, status } = useSession();
  const inProgressRef = useRef(false);

  const handleLogin = useCallback(async function (credentials: string) {
    if (inProgressRef.current) return;
    inProgressRef.current = true;
    try {
      const res = await signIn("google-one-tap", {
        credential: credentials,
        redirect: true,
      });
      console.log("one-tap signIn result", res);
    } finally {
      // 等待认证流接管路由，不立即清除 inProgress，避免频繁触发
      setTimeout(() => {
        inProgressRef.current = false;
      }, 5000);
    }
  }, []);

  const oneTapLogin = useCallback(async function () {
    const options = {
      client_id: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID,
      auto_select: false,
      cancel_on_tap_outside: true,
      context: "signin",
    };

    // console.log("onetap login trigger", options);

    if (!inProgressRef.current) {
      googleOneTap(options, (response: any) => {
        console.log("onetap login ok", response);
        handleLogin(response.credential);
      });
    }
  }, [handleLogin]);

  useEffect(() => {
    // console.log("one tap login status", status, session);

    if (status === "unauthenticated") {
      oneTapLogin();
    }
  }, [status, oneTapLogin]);

  return <></>;
};

useOneTapLogin.displayName = "useOneTapLogin";

export default useOneTapLogin;
