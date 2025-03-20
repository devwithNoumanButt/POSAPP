"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";

export function UserNav() {
  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16">
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </header>
  );
} 