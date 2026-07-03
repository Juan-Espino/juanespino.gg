export const blogginRoutes = {
  home: "/bloggin",
  articles: "/bloggin/articles",
  drafts: "/bloggin/drafts",
  new: "/bloggin/new",
  article: (slug: string) => `/bloggin/article/${slug}`,
  edit: (slug: string) => `/bloggin/edit/${slug}`,
} as const;
