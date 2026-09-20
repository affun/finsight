# FinSight — Personal Finance Intelligence

<p align="center">
  <img src="src/app/icon.svg" width="80" height="80" alt="FinSight Logo" />
</p>

FinSight is a modern, AI-powered personal finance intelligence platform built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Recharts**, and **pnpm**.

Recreated directly from Figma AI-approved designs, FinSight delivers a crisp, high-density financial command center with customizable Bento grid layouts, real-time spending insights, smart budgeting, goal tracking, and an integrated AI assistant.

---

## ⚡ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript (Strict Mode)](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + CSS Custom Variables
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts & Data Visualization**: [Recharts](https://recharts.org/)
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## ✨ Features

- 🎨 **Figma-Faithful Design**: Preserved 1:1 layout boundaries, cards, spacing, borders, shadows, and curated color palettes.
- 📊 **Customizable Bento Grid Dashboard**: Toggle widgets on/off, switch presets (*Overview*, *Spending*, *Savings*, *Minimal*), and inspect Net Worth sparklines.
- 🤖 **FinSight AI Assistant**: Interactive conversational AI assistant offering personalized spending breakdown and budget recommendations.
- 💸 **Transaction Intelligence**: Dual view modes (*Categorized Bento Groups* & *Raw Data Table*), live search, multi-category chips, and sorting.
- 🏦 **Accounts Command Center**: Total assets, liabilities, net worth KPIs, account cards with sparklines, and recent transaction feeds.
- 🎯 **Goals & Milestones**: Target dates, monthly contribution calculations, percentage complete progress bars, and remaining balances.
- ⚡ **Smart Budgets**: Category limits, color-coded status badges (*On Track*, *Close to Limit*, *Over Budget*), and overspend banners.
- 📈 **Analytics Hub**: Cash flow bar charts, spending pie charts, net worth history, monthly trends, and category comparisons.
- 🌗 **Adaptive Dark & Light Theme**: Seamless theme engine supporting Dark (`#0B1120`), Light (`#F8FAFC`), and System preference with persistence.

---

## 📁 Project Architecture

```text
FinSight/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout with fonts & ThemeProvider
│   │   ├── page.tsx                  # Public Landing page
│   │   ├── globals.css               # Design tokens & dark/light theme variables
│   │   ├── login/
│   │   │   └── page.tsx              # Authentication - Sign In
│   │   ├── register/
│   │   │   └── page.tsx              # Authentication - Sign Up
│   │   ├── ai/
│   │   │   └── page.tsx              # Redirect route to /ai-assistant
│   │   └── (app)/                    # Authenticated route group
│   │       ├── layout.tsx            # App shell with persistent Sidebar
│   │       ├── dashboard/
│   │       │   └── page.tsx          # Bento Grid Dashboard
│   │       ├── transactions/
│   │       │   └── page.tsx          # Transactions Intelligence Page
│   │       ├── accounts/
│   │       │   └── page.tsx          # Accounts Overview & Sparklines
│   │       ├── budgets/
│   │       │   └── page.tsx          # Budgets Tracker & Warnings
│   │       ├── goals/
│   │       │   └── page.tsx          # Financial Goals & Progress
│   │       ├── analytics/
│   │       │   └── page.tsx          # Deep Analytics & Charts
│   │       ├── ai-assistant/
│   │       │   └── page.tsx          # AI Assistant Conversational Chat
│   │       └── settings/
│   │           └── page.tsx          # Settings & Profile Management
│   ├── components/
│   │   ├── auth/
│   │   │   └── Auth.tsx              # Reusable login/register component
│   │   ├── layout/
│   │   │   └── Sidebar.tsx           # Navigation Sidebar & Mobile Drawer
│   │   └── providers/
│   │       └── ThemeProvider.tsx     # Light/Dark/System Theme Context
│   └── lib/
│       └── data/
│           └── mockData.ts           # Centralized mock data models
├── public/                           # Static assets
├── next.config.ts                    # Next.js configuration
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript strict configuration
└── pnpm-lock.yaml                    # Lockfile
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18+) and [pnpm](https://pnpm.io/) installed.

```bash
npm install -g pnpm
```

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/affun/finsight.git
cd finsight
pnpm install
```

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🛠 Available Scripts

- **`pnpm dev`**: Starts the Next.js development server.
- **`pnpm build`**: Compiles the application into an optimized production build.
- **`pnpm start`**: Runs the production server after building.
- **`pnpm typecheck`**: Runs TypeScript type checking (`tsc --noEmit`).

---

## 🎨 Color Palette & Design Tokens

### Brand
- **Primary Indigo**: `#6366F1`
- **Primary Dark**: `#4F46E5`
- **AI Accent Violet**: `#8B5CF6`

### Dark Theme (Default)
- **Background**: `#0B1120`
- **Surface Card**: `#111827`
- **Elevated Surface**: `#172033`
- **Border**: `#1E293B`
- **Foreground Text**: `#F8FAFC`
- **Muted Text**: `#94A3B8`

### Light Theme
- **Background**: `#F8FAFC`
- **Surface Card**: `#FFFFFF`
- **Elevated Surface**: `#F1F5F9`
- **Border**: `#E2E8F0`
- **Foreground Text**: `#0F172A`
- **Muted Text**: `#64748B`

---

## 📜 License

Created for **FinSight — Personal Finance Intelligence**.
