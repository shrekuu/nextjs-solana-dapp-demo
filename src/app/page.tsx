"use client";

import SignIn from "./SignIn";
import { useEffect } from "react";
import { useSessionStore } from "@/store/sessionStore";

export default function Page() {
  const initApp = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();

      if (res.ok && data.success) {
        useSessionStore.setState((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  return (
    <div>
      <SignIn />
    </div>
  );
}
