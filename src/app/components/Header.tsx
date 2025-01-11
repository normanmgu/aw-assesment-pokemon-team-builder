// components/Header.tsx
"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold">
            Hello, <span className="text-primary">{session?.user?.name}</span>
          </h1>
          <p className="text-muted-foreground">Build your dream team</p>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
}