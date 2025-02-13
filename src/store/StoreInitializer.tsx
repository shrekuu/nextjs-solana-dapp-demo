"use client";

import { useRef } from "react";
import { TSessionData, useSessionStore } from "./sessionStore";

export default function StoreInitializer({ session }: { session?: TSessionData }) {
  const isInitialized = useRef(false);

  if (!isInitialized.current) {
    if (session) {
      useSessionStore.setState((prev) => ({ ...prev, ...session }));
    }

    isInitialized.current = true;
  }

  return null;
}
