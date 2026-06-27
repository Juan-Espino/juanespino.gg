import {
  boolean,
  index,
  pgTableCreator,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const createTable = pgTableCreator((name) => `bloggin_${name}`);

export const articles = createTable(
  "article",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    title: d.varchar({ length: 256 }).notNull(),
    slug: d.varchar({ length: 256 }).notNull().unique(),
    imageUrl: text("image_url"),
    content: text("content").notNull(),
    published: boolean("published").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  }),
  (t) => [
    index("article_slug_idx").on(t.slug),
    index("article_created_at_idx").on(t.createdAt),
    index("article_published_idx").on(t.published),
    index("article_author_id_idx").on(t.authorId),
  ],
);

export type Article = typeof articles.$inferSelect;
