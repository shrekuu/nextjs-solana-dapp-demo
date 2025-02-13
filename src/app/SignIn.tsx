"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { TSessionData, useSessionStore } from "@/store/sessionStore";

const getNonce = async (address: string): Promise<string> => {
  const res = await fetch(`/api/auth/nonce?address=${address}`);
  const data = await res.json();

  if (!res.ok && !data.success) {
    throw Error(data.message || "Failed to get nonce");
  }

  return data.data.nonce;
};

const verifySignature = async (address: string, nonce: string, message: string, signature: Uint8Array): Promise<TSessionData> => {
  // Since JSON doesn't support binary data like Uint8Array
  // encode signature before sending to the server
  const encodedSignature = Buffer.from(signature).toString("base64");

  const res = await fetch("/api/auth/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address,
      nonce,
      message: message,
      signature: encodedSignature,
    }),
  });

  const data = await res.json();

  if (!res.ok && !data.success) {
    throw Error(data.message);
  }

  return data.data;
};

export default function SignIn() {
  const { publicKey, signMessage, wallet, connected, connecting } = useWallet();

  const sessionStore = useSessionStore();

  const handleSignIn = async () => {
    if (!connected || !publicKey) {
      alert("Please connect to your wallet");
      return;
    }

    try {
      if (!publicKey) throw new Error("Wallet not connected!");
      if (!signMessage) throw new Error("Wallet does not support message signing!");

      const address = publicKey.toBase58();

      const nonce = await getNonce(address);

      const message = `${window.location.host} wants you to sign in with your Solana account:\n${address}\n\nPlease sign in. \n\nnonce: ${nonce}`;
      const encodedMessage = new TextEncoder().encode(message);

      const signature = await signMessage(encodedMessage);

      const session = await verifySignature(address, nonce, message, signature);

      useSessionStore.setState((prev) => ({ ...prev, ...session }));

      toast.success("Sign Message successful");
    } catch (error: any) {
      toast.error(`Sign Message failed: ${error?.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/session?action=logout");
      const data = await res.json();

      if (!res.ok && !data.success) {
        throw Error(data.message || "Failed to sign out");
      }

      useSessionStore.setState((prev) => ({ ...prev, ...data.data }));

      // disconnect wallet
      await wallet?.adapter.disconnect();

      toast.success("Sign out successful");
    } catch (error: any) {
      toast.error(`Sign out failed: ${error?.message}`);
    }
  };

  const refreshSession = async () => {
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

  return (
    <div className="px-4 py-10 space-y-2">
      <div>
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Next.js Solana Dapp Demo</h1>
      </div>

      <div className="flex flex-col  gap-2">
        {/* status */}
        <div>status: {connected ? "connected" : connecting ? "connecting" : "disconnected"}</div>

        {/* btn to connect to wallet */}
        <div>
          <WalletMultiButton />
        </div>

        {/* button sign in, sign out */}
        <div>
          {connected ? (
            sessionStore.authenticated ? (
              <button
                type="button"
                className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            ) : (
              // btn sign message to login
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                onClick={handleSignIn}
                disabled={!publicKey || !signMessage}
              >
                Sign message to sign in
              </button>
            )
          ) : null}
        </div>
      </div>

      <div>
        <div>
          <button
            type="button"
            className="py-1.5 px-4 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
            onClick={refreshSession}
            title="Refresh session"
          >
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"
              />
            </svg>
          </button>
        </div>
        <pre>
          <code className="font-mono text-sm">{JSON.stringify(sessionStore, null, 2)}</code>
        </pre>
      </div>

      <div>
        <div className="mt-10 text-neutral-800 text-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Notes:</h2>
          <ul className="max-w-md space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400">
            <li>The "Select Wallet" button is part of the Wallet Adapter UI.</li>
          </ul>
        </div>

        <div className="mt-10 text-neutral-800 text-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Todos:</h2>
          <ul className="max-w-md space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400">
            <li>add read contract demo</li>
            <li>add send trasaction(write contract) demo</li>
            <li>create another remo and add EVM chain wallet sign-in feature</li>
          </ul>
        </div>

        <div className="mt-10 text-neutral-800 text-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">References:</h2>
          <ul className="max-w-md space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400">
            <li>
              <a href="https://solana.com/developers/cookbook/wallets/connect-wallet-react" target="_blank">
                How to Connect a Wallet with React (Solana Developer Docs)
              </a>
            </li>
            <li>
              <a href="https://solana.com/developers/guides/wallets/add-solana-wallet-adapter-to-nextjs" target="_blank">
                Add Solana Wallet Adapter to a NextJS application (Solana Developer Docs)
              </a>
            </li>
            <li>
              <a href="https://github.com/anza-xyz/wallet-adapter" target="_blank">
                Wallet Adapter SDK (anza)
              </a>
            </li>
            <li>
              <a href="https://anza-xyz.github.io/wallet-adapter/example/" target="_blank">
                Wallet Adapter Demo (anza)
              </a>
            </li>
            <li>
              <a href="https://docs.phantom.com/solana/signing-a-message" target="_blank">
                Signing a Message (Phantom Developer Docs)
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
