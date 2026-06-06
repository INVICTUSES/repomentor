"use client";

import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { Github, LogOut, Loader2 } from "lucide-react";

const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (!authEnabled) return null;

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt=""
            width={28}
            height={28}
            className="w-7 h-7 rounded-full"
          />
        )}
        <span className="text-sm text-[var(--color-muted)] hidden sm:inline">
          {session.user.name}
        </span>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("github")}
      className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-colors"
    >
      <Github className="w-4 h-4" />
      Sign in with GitHub
    </button>
  );
}
