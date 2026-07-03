import { Search, Heart, ShoppingBag, Home, Grid3x3, User } from "lucide-react";
import { ENV } from "@/config/env";
import { usePages } from "@/hooks/usePages";
import { useBuilderStore } from "@/store/builderStore";

/** Functional bottom tab bar — navigates the preview like the real app. */
function BottomTabBar() {
  const { data: pages } = usePages();
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);
  const catalogPreview = useBuilderStore((s) => s.catalogPreview);
  const appScreen = useBuilderStore((s) => s.appScreen);
  const selectPage = useBuilderStore((s) => s.selectPage);
  const selectCatalog = useBuilderStore((s) => s.selectCatalog);
  const setAppScreen = useBuilderStore((s) => s.setAppScreen);

  const homePage = (pages ?? []).find((p) => p.pageType === "HOME");
  const accountPage = (pages ?? []).find((p) => p.pageType === "ACCOUNT");

  const onHome = homePage?.id === selectedPageId && !catalogPreview && !appScreen;
  const onCategories = !!catalogPreview;
  const onWishlist = appScreen === "wishlist";
  const onAccount =
    appScreen === "account" ||
    (!!accountPage && accountPage.id === selectedPageId && !catalogPreview && !appScreen);

  const tabs = [
    {
      icon: Home,
      label: "Home",
      active: onHome,
      onClick: () => homePage && selectPage(homePage.id),
    },
    {
      icon: Grid3x3,
      label: "Categories",
      active: onCategories,
      onClick: () => selectCatalog({ kind: "collection-index" }),
    },
    {
      icon: Heart,
      label: "Wishlist",
      active: onWishlist,
      onClick: () => setAppScreen("wishlist"),
    },
    {
      icon: User,
      label: "Account",
      active: onAccount,
      onClick: () =>
        accountPage ? selectPage(accountPage.id) : setAppScreen("account"),
    },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 grid grid-cols-4 border-t bg-white/95 px-2 pb-5 pt-2 backdrop-blur">
      {tabs.map((t) => (
        <button
          key={t.label}
          onClick={t.onClick}
          className={`flex flex-col items-center gap-0.5 text-[9px] transition-colors ${
            t.active ? "text-black" : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <t.icon className="h-4 w-4" />
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { data: pages } = usePages();
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);
  const catalogPreview = useBuilderStore((s) => s.catalogPreview);
  const appScreen = useBuilderStore((s) => s.appScreen);

  const homePage = (pages ?? []).find((p) => p.pageType === "HOME");
  const isHomePage = homePage?.id === selectedPageId && !catalogPreview && !appScreen;

  return (
    <div className="relative h-[760px] w-[380px] rounded-[3rem] border-[10px] border-black bg-black shadow-2xl">
      {/* Notch */}
      <div className="absolute left-1/2 top-2 z-30 h-6 w-32 -translate-x-1/2 rounded-full bg-black" />

      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.3rem] bg-white">
        {/* Status bar */}
        {isHomePage ? (
          <div className="absolute inset-x-0 top-0 z-30 flex shrink-0 items-center justify-between bg-transparent px-6 pb-1 pt-3 text-[11px] font-semibold text-white">
            <span>9:41</span>
            <span className="flex items-center gap-1">▦ ▂ ▅ 􀛨</span>
          </div>
        ) : (
          <div className="flex shrink-0 items-center justify-between bg-white px-6 pb-1 pt-3 text-[11px] font-semibold text-black">
            <span>9:41</span>
            <span className="flex items-center gap-1">▦ ▂ ▅ 􀛨</span>
          </div>
        )}

        {/* App header */}
        {!isHomePage && (
          <div className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-2.5">
            <span className="text-sm font-black tracking-widest">
              {ENV.storeBrandName}
            </span>
            <div className="flex items-center gap-3 text-zinc-700">
              <Search className="h-4 w-4" />
              <Heart className="h-4 w-4" />
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto bg-zinc-50">
          {children}
          <div className="h-20" />
        </div>

        {/* Bottom tab bar */}
        <BottomTabBar />
      </div>
    </div>
  );
}
