import { relations } from "drizzle-orm";

import { account, session, user, verification } from "./auth-schema";
import { articles } from "./app-schema";

export * from "./auth-schema";
export * from "./app-schema";

export const userRelations = relations(user, ({ many }) => ({
  account: many(account),
  session: many(session),
  articles: many(articles),
}));

export const articleRelations = relations(articles, ({ one }) => ({
  author: one(user, { fields: [articles.authorId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));
