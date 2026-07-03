import {
  Home,
  FolderOpen,
  Shirt,
  Table2,
  ShoppingCart,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import type { PageType } from "@/types";

export interface PageNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  pageType: PageType;
  /**
   * When a slot has no matching CMS page, it can instead browse the live
   * Shopify catalog (collections / products) under it.
   */
  catalog?: "collections" | "products";
}

// The fixed system pages shown at the top of the sidebar (Appbrew-style).
export const SYSTEM_PAGES: PageNavItem[] = [
  { key: "home", label: "Home", icon: Home, pageType: "HOME" },
  {
    key: "collections",
    label: "Collections",
    icon: FolderOpen,
    pageType: "COLLECTION",
    catalog: "collections",
  },
  {
    key: "products",
    label: "Product Page",
    icon: Shirt,
    pageType: "PRODUCT",
    catalog: "products",
  },
  { key: "cart", label: "Cart", icon: ShoppingCart, pageType: "CART" },
  { key: "account", label: "Account", icon: UserCircle, pageType: "ACCOUNT" },
];

// pageTypes that fall under the collapsible "Custom pages" group.
export const CUSTOM_PAGE_TYPES: PageType[] = ["CUSTOM", "LANDING"];
