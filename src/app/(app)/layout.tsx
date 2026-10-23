"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Building2,
  FileText,
  LayoutDashboard,
  Menu,
  Moon,
  Receipt,
  Sun,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "../providers";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/entities", label: "Entities", icon: Building2 },
  { href: "/investments", label: "Investments", icon: Wallet },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/counterparties", label: "Counterparties", icon: Users },
];

function initials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* resolvedTheme is unknown on the server; the mismatch is expected and contained here. */}
      <span suppressHydrationWarning>
        {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </span>
    </Button>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-l-primary bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ user, logout }: { user: ReturnType<typeof useAuth>["user"]; logout: () => void }) {
  return (
    <div className="mt-auto flex items-center gap-2 border-t border-sidebar-border pt-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {initials(user?.full_name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{user?.full_name}</div>
        <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
      </div>
      <ThemeToggle />
      <Button variant="ghost" size="sm" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileNavOpen(false);
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            A
          </div>
          <span className="text-lg font-semibold tracking-tight">AltsManager</span>
        </div>
        <NavLinks pathname={pathname} />
        <SidebarFooter user={user} logout={logout} />
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            A
          </div>
          <span className="text-base font-semibold tracking-tight">AltsManager</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
      </div>

      {/* Mobile slide-over */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/30"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between px-2">
              <span className="text-lg font-semibold tracking-tight">AltsManager</span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close navigation"
                onClick={() => setMobileNavOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
            <SidebarFooter user={user} logout={logout} />
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 pt-20 md:p-8 md:pt-8">{children}</main>
    </div>
  );
}
