import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  BookOpen,
  ClipboardList,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Target,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/plans", label: "Plans", icon: ClipboardList },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/library", label: "Library", icon: BookOpen },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Desktop top nav */}
      <header className="hidden border-b md:block">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <NavLink
              to="/dashboard"
              className="text-sm font-semibold tracking-tight"
            >
              FitTrack<span className="text-muted-foreground">Hub</span>
            </NavLink>
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "rounded-md px-3 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="hidden text-xs text-muted-foreground lg:block">
                {user.email}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="size-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-24 md:px-6 md:pb-12">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn("size-5", isActive && "stroke-[1.75]")}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
