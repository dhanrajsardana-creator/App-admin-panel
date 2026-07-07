import { Home, LayoutGrid, Heart, User } from "lucide-react";
import { FigmaHomeSections } from "@/features/builder/FigmaHomeSections";

/**
 * Standalone, public preview of the Figma "Powerlook App" homepage replica.
 * Shares the section stack with the builder preview via <FigmaHomeSections />.
 */

const TABS = [
  { icon: Home, label: "Home", active: true },
  { icon: LayoutGrid, label: "Categories", active: false },
  { icon: Heart, label: "Wishlist", active: false },
  { icon: User, label: "Account", active: false },
];

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[800px] w-[390px] rounded-[3rem] border-[10px] border-black bg-black shadow-2xl">
      <div className="absolute left-1/2 top-2 z-30 h-6 w-32 -translate-x-1/2 rounded-full bg-black" />
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.3rem] bg-black">
        {/* Scrollable content */}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
          {children}
          <div className="h-16 bg-black" />
        </div>
        {/* Bottom tab bar (Figma dark style) */}
        <div className="absolute bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-white/10 bg-black/95 px-2 pb-5 pt-2 backdrop-blur">
          {TABS.map((t) => (
            <button
              key={t.label}
              className={`flex flex-col items-center gap-0.5 text-[9px] transition-colors ${
                t.active ? "text-white" : "text-white/40"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FigmaHomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-4 bg-zinc-200 py-8">
      <div className="text-center">
        <h1 className="text-lg font-semibold text-zinc-800">
          Powerlook — Figma Homepage Replica
        </h1>
        <p className="text-xs text-zinc-500">
          Static preview assembled from the Figma design · /figma-home
        </p>
      </div>

      <PhoneShell>
        <FigmaHomeSections />
      </PhoneShell>
    </div>
  );
}
