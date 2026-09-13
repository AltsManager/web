"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../providers";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/entities", label: "Entities" },
  { href: "/investments", label: "Investments" },
  { href: "/transactions", label: "Transactions" },
  { href: "/documents", label: "Documents" },
  { href: "/counterparties", label: "Counterparties" },
];

export default function AppLayout({ children }: LayoutProps<"/">) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/20 p-4">
        <div className="mb-6 px-2 text-lg font-semibold">AltsManager</div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t pt-4">
          <div className="px-2 text-sm">
            <div className="font-medium">{user?.full_name}</div>
            <div className="text-xs text-muted-foreground">{user?.role}</div>
          </div>
          <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={logout}>
            Log out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
