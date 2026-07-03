import {
  Heart,
  ChevronRight,
  Package,
  MapPin,
  Ticket,
  Bell,
  HelpCircle,
  LogOut,
  UserCircle2,
} from "lucide-react";
import type { AppScreen } from "@/store/builderStore";

/** Empty wishlist screen (no wishlist API wired). */
function WishlistScreen() {
  return (
    <div>
      <h2 className="border-b px-4 py-3 text-sm font-bold uppercase tracking-wide">
        Wishlist
      </h2>
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-24 text-center">
        <Heart className="h-10 w-10 text-zinc-300" />
        <p className="text-sm font-medium text-zinc-600">
          Your wishlist is empty
        </p>
        <p className="text-xs text-zinc-400">
          Tap the heart on any product to save it here.
        </p>
      </div>
    </div>
  );
}

/** Account screen — profile header + menu (mock; no auth wired). */
function AccountScreen() {
  const menu = [
    { icon: Package, label: "My Orders" },
    { icon: MapPin, label: "Addresses" },
    { icon: Heart, label: "Wishlist" },
    { icon: Ticket, label: "Coupons & Offers" },
    { icon: Bell, label: "Notifications" },
    { icon: HelpCircle, label: "Help & Support" },
  ];
  return (
    <div>
      <h2 className="border-b px-4 py-3 text-sm font-bold uppercase tracking-wide">
        Account
      </h2>

      {/* Profile header */}
      <div className="flex items-center gap-3 bg-zinc-50 px-4 py-4">
        <UserCircle2 className="h-12 w-12 text-zinc-400" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-800">
            Guest User
          </p>
          <p className="truncate text-xs text-zinc-500">
            Sign in to view orders & rewards
          </p>
        </div>
        <button className="rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white">
          Login
        </button>
      </div>

      {/* Menu */}
      <div className="divide-y">
        {menu.map((m) => (
          <button
            key={m.label}
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <m.icon className="h-4 w-4 shrink-0 text-zinc-500" />
            <span className="flex-1 text-sm text-zinc-700">{m.label}</span>
            <ChevronRight className="h-4 w-4 text-zinc-300" />
          </button>
        ))}
        <button className="flex w-full items-center gap-3 px-4 py-3 text-left">
          <LogOut className="h-4 w-4 shrink-0 text-rose-500" />
          <span className="flex-1 text-sm text-rose-500">Logout</span>
        </button>
      </div>
    </div>
  );
}

export function AppScreenPreview({ screen }: { screen: AppScreen }) {
  if (screen === "wishlist") return <WishlistScreen />;
  if (screen === "account") return <AccountScreen />;
  return null;
}
