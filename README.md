# PromptUI

**Describe a UI in plain language — get a production-ready Next.js app in seconds.**

[Overview](#overview) • [Features](#features) • [Tech Stack](#tech-stack) • [Architecture](#architecture) • [Getting Started](#getting-started) • [Usage](#usage) • [Project Structure](#project-structure)

---

## Overview

PromptUI is an AI-powered UI generation platform that converts natural-language prompts into fully functional, production-quality Next.js applications. Users describe what they want — a dashboard, a chat UI, a portfolio — and PromptUI spins up a sandboxed environment, runs an AI coding agent, builds the app, and serves a live preview in-browser.

Think of it as an open-source [v0.dev](https://v0.dev) with full sandbox execution, conversational iteration, and a built-in code explorer.

---

## Features

- 🤖 **AI Code Generation** — Multi-agent pipeline powered by Inngest Agent Kit turns prompts into complete Next.js apps
- 🔀 **Conversational Iteration** — Send follow-up messages to refine and evolve generated UI within the same project
- 🖥️ **Live Preview** — Sandboxed apps are built and served via E2B, viewable in an embedded iframe with refresh and open-in-tab controls
- 📂 **Integrated Code Explorer** — Browse the generated file tree, view syntax-highlighted source code (Prism.js), and copy to clipboard
- 🧩 **Prompt Templates** — One-click starter templates for common app types (notes, dashboard, chat, calendar, todo, portfolio, and more)
- 🔐 **Auth & User Management** — Clerk-based authentication with automatic user onboarding and per-user project isolation
- 🗄️ **Persistent Projects** — Projects, messages, and generated fragments are stored in PostgreSQL via Prisma ORM
- 📱 **Responsive UI** — Split-pane workspace with resizable panels adapts to desktop and mobile viewports

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, RSC) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix Nova style) |
| Authentication | [Clerk](https://clerk.com/) (`@clerk/nextjs`) |
| Database | [PostgreSQL](https://www.postgresql.org/) via [Prisma 7](https://www.prisma.io/) (with `@prisma/adapter-pg`) |
| AI Orchestration | [Inngest](https://www.inngest.com/) + [Inngest Agent Kit](https://www.inngest.com/docs/agent-kit) |
| LLM Provider | [OpenRouter](https://openrouter.ai/) (StepFun `step-3.5-flash` model) |
| Sandbox Runtime | [E2B](https://e2b.dev/) (cloud sandboxes for code execution and builds) |
| Data Fetching | [TanStack React Query](https://tanstack.com/query) |
| Form Handling | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Code Highlighting | [Prism.js](https://prismjs.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Notifications | [Sonner](https://sonner.emilkowal.dev/) |
| Panels | [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) |

---

## Architecture

PromptUI is a monolithic Next.js 16 application that uses the App Router with route groups, server actions, and a background job system for AI orchestration.

### High-Level Flow

```
User prompt → Server Action → Inngest Event → Agent Network (E2B Sandbox)
                                                    ↓
                                        Files written + built in sandbox
                                                    ↓
                                        Live URL saved → Fragment stored in DB
                                                    ↓
                                        Client polls via React Query → Live preview rendered
```

### Top-Level Structure

```
promptui/
├── app/                    # Next.js App Router (pages, layouts, API routes)
├── components/             # React components (UI primitives + shared)
├── modules/                # Feature modules (server actions + client hooks)
├── inngest/                # AI agent pipeline (Inngest functions)
├── lib/                    # Shared utilities (Prisma client, helpers)
├── hooks/                  # Custom React hooks
├── prisma/                 # Database schema and migrations
├── generated/              # Prisma-generated client output
├── sandbox/                # E2B sandbox template definition
├── public/                 # Static assets (logo, hero image, icons)
├── prompt.ts               # System prompts for the AI agent pipeline
└── proxy.ts                # Clerk auth middleware configuration
```

---

### `app/` — Routes & Layouts

Uses Next.js route groups to separate authentication and app flows:

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Landing page — redirects authenticated users to `/project` |
| `/sign-in` | `app/(auth)/sign-in/[[...sign-in]]/page.tsx` | Clerk sign-in (catch-all) |
| `/sign-up` | `app/(auth)/sign-up/[[...sign-up]]/page.tsx` | Clerk sign-up (catch-all) |
| `/project` | `app/(root)/project/page.tsx` | Project builder — prompt form + templates |
| `/myprojects` | `app/(root)/myprojects/page.tsx` | List all user projects |
| `/projects/:id` | `app/(root)/projects/[projectId]/page.tsx` | Project workspace — chat + preview + code |
| `/api/inngest` | `app/api/inngest/route.ts` | Inngest webhook endpoint (serves `codeAgent` function) |

The `(root)` layout calls `onboardUser()` on every request to auto-create DB records for new Clerk users.

**Provider tree** (root layout):

```
ClerkProvider → html → body → QueryProvider → TooltipProvider → {children} + Toaster
```

---

### `inngest/` — AI Agent Pipeline

The core generation engine. When a user submits a prompt, a server action sends an Inngest event (`code-agent/run`) that triggers the `codeAgent` function.

**Pipeline steps:**

1. **Create sandbox** — Spins up an E2B sandbox from a pre-built Next.js template
2. **Load context** — Fetches previous messages for the project from the DB
3. **Run agent network** — A coding agent with three tools:
   - `terminal` — Executes shell commands in the sandbox
   - `createOrUpdateFiles` — Writes files to the sandbox filesystem
   - `readFiles` — Reads files from the sandbox filesystem
4. **Sync files** — Re-writes all state-tracked files to the sandbox before build
5. **Build & serve** — Runs `next build` + `next start` inside the sandbox, polls until the app is live
6. **Generate metadata** — Two additional agents produce a short fragment title and a user-facing response message
7. **Save result** — Persists the assistant message + fragment (sandbox URL, title, files JSON) to the database

Key interface — the agent network state:

```typescript
createState<{
  summary: string,
  files: Record<string, string>,
  messages: Array<{ type: string; role: string; content: string }>
}>
```

---

### `modules/` — Feature Modules

Each module encapsulates server actions (`"use server"`) and client-side React Query hooks for a domain:

| Module | Server Actions | Client Hooks |
|---|---|---|
| `auth` | `onboardUser()`, `getCurrentUser()` | — |
| `project` | `createProject()`, `getProjects()`, `getProjectById()` | `useCreateProject()`, `useGetProjects()`, `useGetProjectById()` |
| `message` | `createMessages()`, `getMessages()` | `useCreateMessages()`, `useGetMessages()`, `prefetchMessages()` |

The message hooks use **smart polling**: `refetchInterval` returns `3000` when the last message has role `USER` (waiting for AI response), and `false` otherwise.

---

### `components/` — UI Layer

| Directory | Contents |
|---|---|
| `ui/` | 22 shadcn/ui primitives (Button, Card, Tabs, Sidebar, Resizable, etc.) |
| `Shared/` | App-specific components — Navbar, AuthNavbar, ProjectBuilder, ProjectForm, ProjectView, MyProjects |
| `Shared/ProjectComponents/` | Project workspace internals — MessageContainer, MessageCard, MessageForm, FragmentWeb, FileExplorer, TreeView, CodeView |

The project workspace (`ProjectView`) renders a resizable two-panel layout:
- **Left panel**: Project header + message thread + message input form
- **Right panel**: Tabbed view with "Demo" (iframe preview) and "Code" (file explorer with syntax highlighting)

---

### `prisma/` — Database Schema

```prisma
model User {
  id        String    @id @default(uuid())
  email     String    @unique
  clerkId   String    @unique
  name      String?
  image     String?
  projects  Project[]
}

model Project {
  id        String    @id @default(uuid())
  name      String
  userId    String
  messages  Message[]
}

model Message {
  id        String       @id @default(uuid())
  content   String
  role      MessageRole  // USER | ASSISTANT
  type      MessageType  // RESULT | ERROR
  projectId String
  fragments Fragment?
}

model Fragment {
  id         String  @id @default(uuid())
  messageId  String  @unique
  sandboxUrl String
  title      String
  files      Json
}
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [npm](https://www.npmjs.com/) v10+
- [PostgreSQL](https://www.postgresql.org/) database (local or hosted)
- [Clerk](https://clerk.com/) account (for authentication keys)
- [Inngest](https://www.inngest.com/) account (for event/signing keys, or use the [Inngest Dev Server](https://www.inngest.com/docs/local-development))
- [OpenRouter](https://openrouter.ai/) API key (for LLM access)
- [E2B](https://e2b.dev/) account (for sandbox API key + sandbox template ID)

### Installation

```bash
git clone https://github.com/Omkar-kamble82/PromptUI.git
cd PromptUI
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```bash
# ── Authentication (Clerk) ───────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/project

# ── Database (PostgreSQL) ────────────────────────────────
DATABASE_URL=postgresql://user:password@host:5432/promptui

# ── AI Orchestration (Inngest) ───────────────────────────
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key

# ── LLM Provider (OpenRouter) ───────────────────────────
OPENROUTER_API_KEY=sk-or-...

# ── Sandbox Runtime (E2B) ───────────────────────────────
E2B_API_KEY=e2b_...
E2B_SANDBOX_ID=your-sandbox-template-id
```

### Database Setup

```bash
# Generate the Prisma client
npx prisma generate

# Run migrations against your database
npx prisma migrate deploy
```

### Build the E2B Sandbox Template (one-time)

The sandbox template is defined in `sandbox/template.ts`. Build it using the E2B CLI:

```bash
npx tsx sandbox/template.ts
```

This outputs a template ID — set it as `E2B_SANDBOX_ID` in your `.env`.

### Running

```bash
# Start the Next.js dev server
npm run dev

# In a separate terminal, start the Inngest Dev Server
npx inngest-cli@latest dev
```

The app will be available at `http://localhost:3000`. The Inngest dashboard runs at `http://localhost:8288`.

---

## Usage

### Creating a Project

1. Sign in at `/sign-in` (or create an account at `/sign-up`)
2. You'll be redirected to the **Project Builder** at `/project`
3. Either write a prompt (20–500 chars) describing the UI you want, or click a **template card** to pre-fill
4. Click **Create Project** — you'll be taken to the project workspace

### Project Workspace

The workspace is a split-pane interface:

| Panel | Description |
|---|---|
| **Left — Chat** | Conversation thread with the AI agent. Send follow-up messages to iterate on the generated UI. |
| **Right — Demo** | Live iframe preview of the generated app. Includes refresh, copy URL, and open-in-new-tab buttons. |
| **Right — Code** | File explorer with tree navigation and syntax-highlighted code viewer. Click any file to view its source. |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘ Enter` / `Ctrl Enter` | Submit message in the project workspace |

### Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/sign-in` | Public | Authentication |
| `/sign-up` | Public | Registration |
| `/project` | Authenticated | Create new project |
| `/myprojects` | Authenticated | List all projects |
| `/projects/:id` | Authenticated | Project workspace |
| `/api/inngest` | Public (webhook) | Inngest function endpoint |

---

## Project Structure

<details>
<summary>Full file tree</summary>

```
promptui/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx                          # Auth layout wrapper
│   │   ├── sign-in/[[...sign-in]]/page.tsx     # Clerk sign-in page
│   │   └── sign-up/[[...sign-up]]/page.tsx     # Clerk sign-up page
│   ├── (root)/
│   │   ├── layout.tsx                          # Authenticated layout — calls onboardUser()
│   │   ├── myprojects/page.tsx                 # "My Projects" listing page
│   │   ├── project/page.tsx                    # Project builder (prompt form + templates)
│   │   └── projects/[projectId]/page.tsx       # Project workspace (chat + preview + code)
│   ├── api/
│   │   └── inngest/route.ts                    # Inngest webhook handler (serves codeAgent)
│   ├── globals.css                             # Tailwind + shadcn imports
│   ├── layout.tsx                              # Root layout (ClerkProvider, QueryProvider, Toaster)
│   ├── page.tsx                                # Landing page
│   └── favicon.ico
│
├── components/
│   ├── Shared/
│   │   ├── AuthNavbar.tsx                      # Navbar for authenticated pages (UserButton, My Projects link)
│   │   ├── Navbar.tsx                          # Navbar for public landing page
│   │   ├── Myproject.tsx                       # Project cards grid with loading/empty states
│   │   ├── Project-builder.tsx                 # Prompt input + template picker
│   │   ├── ProjectForm.tsx                     # Zod-validated project creation form
│   │   ├── ProjectView.tsx                     # Split-pane workspace (chat | preview/code)
│   │   ├── query-provider.tsx                  # TanStack React Query client provider
│   │   └── ProjectComponents/
│   │       ├── message-container.tsx           # Message thread with auto-scroll and smart polling
│   │       ├── message-card.tsx                # User/Assistant message rendering + fragment cards
│   │       ├── message-form.tsx                # Chat input with ⌘Enter submit
│   │       ├── message-loading.tsx             # Loading skeleton for pending AI responses
│   │       ├── fragment-web.tsx                # Iframe preview with refresh/copy/open controls
│   │       ├── file-explorer.tsx               # Resizable tree + code viewer panel
│   │       ├── tree-view.tsx                   # Recursive file tree component
│   │       └── code-view/
│   │           ├── index.tsx                   # Prism.js syntax-highlighted code block
│   │           └── code-theme.css              # Custom Prism theme
│   └── ui/                                     # 22 shadcn/ui primitives (button, card, tabs, sidebar, etc.)
│
├── modules/
│   ├── auth/
│   │   └── auth.actions.ts                     # onboardUser(), getCurrentUser() server actions
│   ├── message/
│   │   ├── message.actions.ts                  # createMessages(), getMessages() server actions
│   │   ├── hooks.ts                            # useGetMessages(), useCreateMessages() React Query hooks
│   │   └── types.ts                            # ProjectFragment type definition
│   └── project/
│       ├── project.actions.ts                  # createProject(), getProjects(), getProjectById() server actions
│       └── hooks.ts                            # useCreateProject(), useGetProjects(), useGetProjectById() hooks
│
├── inngest/
│   ├── client.ts                               # Inngest client instance (id: "promptui")
│   └── functions.ts                            # codeAgent function — full AI pipeline
│
├── lib/
│   ├── prisma.ts                               # Prisma client singleton (PrismaPg adapter)
│   └── utils.ts                                # cn(), lastAssistantTextMessageContent(), convertFilesToTreeItems()
│
├── hooks/
│   └── use-mobile.ts                           # useIsMobile() responsive breakpoint hook
│
├── prisma/
│   ├── schema.prisma                           # Database schema (User, Project, Message, Fragment)
│   └── migrations/                             # 4 migration files
│
├── generated/
│   └── prisma/                                 # Auto-generated Prisma client
│
├── sandbox/
│   └── template.ts                             # E2B sandbox template builder (Next.js 16 + Tailwind)
│
├── public/
│   ├── logo.png                                # PromptUI logo
│   ├── icon.png                                # PromptUI icon (used in message cards)
│   ├── hero.png                                # Landing page hero image
│   └── *.svg                                   # Default Next.js SVG assets
│
├── prompt.ts                                   # System prompts (PROMPT, SIMPLE_PROMPT, RESPONSE_PROMPT, FRAGMENT_TITLE_PROMPT)
├── proxy.ts                                    # Clerk middleware (route protection)
├── prisma.config.ts                            # Prisma config (schema path, migration path, datasource URL)
├── next.config.ts                              # Next.js config (serverExternalPackages for Prisma)
├── tsconfig.json                               # TypeScript config (ES2023, path aliases)
├── components.json                             # shadcn/ui config (radix-nova style, Lucide icons)
├── eslint.config.mjs                           # ESLint config (next core-web-vitals + typescript)
├── postcss.config.mjs                          # PostCSS config (@tailwindcss/postcss)
├── package.json                                # Dependencies and scripts
├── .env.example                                # Environment variable template
└── .gitignore
```

</details>
