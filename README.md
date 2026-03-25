# ⚡ PromptUI — AI-Powered UI Generation Platform

<p><a href="https://prompt-ui-seven.vercel.app/">PromptUI</a> is a full-stack AI application that transforms simple text prompts into fully functional UI code. Built with Next.js 16 and powered by AI agents, it allows users to generate landing pages dynamically by describing their ideas — with real-time file creation, editing, and execution inside a secure sandbox environment.</p>

<img width="950" height="417" alt="image" src="https://github.com/user-attachments/assets/7dae8648-6004-4135-afab-1f95a3091886" />
<img width="950" height="417" alt="image" src="https://github.com/user-attachments/assets/7ff9cbe8-301d-4431-be3e-cd60a5a30f2f" />
<img width="950" height="416" alt="image" src="https://github.com/user-attachments/assets/3251b969-7507-4bad-b599-6e5ee8103b40" />
<img width="950" height="417" alt="image" src="https://github.com/user-attachments/assets/13bb3090-3860-4601-bb53-6370b173a120" />
<img width="956" height="392" alt="image" src="https://github.com/user-attachments/assets/c285d507-a07b-4835-a434-496a7e500ca7" />


<br/>

## 🧱 Tech Stack

| Layer         | Technologies                              |
| :-------------- | :--------------------------------------- |
| Frontend | Next.js 16, TypeScript, Shadcn UI |
| Backend and Database | Neon DB, Inngest |
| ORM | Prisma |
| AI Agents | Inngest Agents |
| Sandbox Environment | E2B |
| Authentication | Clerk |
| Deployment | Vercel |

---

## 🚀 Features

### 🎨 Prompt-to-UI Generation

- Users can describe a landing page using natural language.
- AI agents interpret prompts and generate complete UI code.
- Supports iterative updates — refine UI by editing prompts.

---

### 🤖 AI Agent System

- Built using Inngest agents with specialized tools:
  - **terminal** → Executes commands inside sandbox.
  - **createOrUpdateFiles** → Generates and edits project files.
  - **readFiles** → Reads existing code for context-aware updates.
- Enables autonomous UI generation workflow.

---

### 🧪 Secure Code Sandbox

- Powered by E2B sandbox environment.
- Runs generated code in an isolated environment.
- Ensures safe execution of AI-generated files and commands.

---

### 🧱 Modern UI & Components

- Built using Shadcn UI for clean and responsive design.
- Modular component-based architecture.
- Easily extendable UI system.

---

### 🔐 Authentication

- Integrated Clerk authentication.
- Secure login/signup flows.

---

### 🧑‍💻 Future Enhancements

- Export generated UI as full production-ready projects.
- Support for multiple frameworks (React, Vue, etc.).
- Version history and rollback for generated UIs.
- Collaboration features for teams.
- Fine-tuned models for better UI generation accuracy.

---

## 📦 Cloning the Repository

```shell
git clone https://github.com/your-username/promptui.git
```

### Install packages

```shell
npm i
```
### Setup .env file


```js
//Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=

//Database (Neon + Prisma)
DATABASE_URL=

//AI & Agents
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
OPENROUTER_API_KEY=

//Sandbox (E2B)
E2B_API_KEY=
E2B_SANDBOX_ID=
```

### Setup Prisma

```shell
npx prisma db push
```

### Start the app

```shell
npm run dev
```
