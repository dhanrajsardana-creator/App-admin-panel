export const qk = {
  pages: ["pages"] as const,
  page: (id: string) => ["pages", id] as const,
  sections: (pageId: string) => ["sections", pageId] as const,
  items: (sectionId: string) => ["items", sectionId] as const,
  mobileHome: ["mobile", "home"] as const,
  mobilePage: (key: string) => ["mobile", "page", key] as const,
  me: ["auth", "me"] as const,
};
