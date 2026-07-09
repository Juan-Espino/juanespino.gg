# juanespino.gg / Bloggin

Personal portfolio and full-stack blog platform built with Next.js, TypeScript, PostgreSQL, Drizzle ORM, Better Auth, and UploadThing.

## Overview

This repo powers two connected experiences:

- `juanespino.gg` - a personal portfolio for projects, writing, and contact.
- `Bloggin` - a full-stack publishing workflow for writing, editing, publishing, and sharing Markdown articles.

I built this as a production-style personal site instead of a static portfolio. The goal was to combine polished presentation with real application behavior: authentication, admin-only content management, database-backed posts, image uploads, and deployed routes.

## Live App

- Portfolio: [juanespino.gg](https://www.juanespino.gg/)
- Bloggin: [juanespino.gg/bloggin](https://www.juanespino.gg/bloggin)

## Features

- Portfolio homepage with project-focused navigation
- Blog article feed with latest published posts
- Markdown-based article editor
- Admin-only create, edit, delete, draft, and publish flows
- GitHub authentication through Better Auth
- PostgreSQL article storage with Drizzle ORM
- Image uploads and cleanup through UploadThing
- Shareable article URLs
- Loading, empty, success, and error states

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Better Auth
- Drizzle ORM
- PostgreSQL
- UploadThing
- PostHog
- Vercel

## Project Structure

```txt
src/app/(portfolio)     Portfolio routes
src/app/bloggin         Bloggin routes
src/app/api             Auth and upload API routes
src/components          Shared UI and blog components
src/components/portfolio Portfolio-specific UI
src/server              Server actions, auth, database, and article logic
src/server/db           Drizzle schema and database client
src/data                Portfolio project data
```

## What This Project Shows

- Full-stack application architecture with a real database
- Server-side data fetching and mutation flows in Next.js
- Authenticated admin workflows with role-based access checks
- Form validation, slug generation, and publish/draft logic
- Product presentation and engineering documentation in one repo

## Running Locally

Install dependencies:

```bash
pnpm install
```

Create an environment file:

```bash
cp .env.example .env
```

Fill in the required environment variables in `.env`, then run the development server:

```bash
pnpm dev
```

Run checks before committing:

```bash
pnpm check
```

## Environment Variables

See [.env.example](./.env.example) for the required variables.

## Future Improvements

- Add automated tests for article actions and admin workflows
- Add richer article metadata and SEO previews
- Improve the editor preview and publishing workflow
- Add project case studies directly into the portfolio section
