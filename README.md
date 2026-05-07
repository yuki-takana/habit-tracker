# Habit Tracker (UFL) Codebase Architecture & Setup Guide

Welcome to the Habit Tracker application. This Next.js (App Router) project follows scalable folder structuring and robust Low-Level Design (LLD) principles, adhering to the SOLID framework.

## 🚀 Setup & Installation 

Follow these steps to get the project up and running locally:

### 1. Prerequisites
- Node.js (v18 or higher)
- Setup a PostgreSQL database (e.g. Supabase, standard local postgres)
- A Prisma compatible URI

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file at the root of the project with the necessary environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/habittracker?schema=public"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
# Add any API Keys (Stripe, Razorpay, Groq, Twilio, etc.)
```

### 4. Database Setup (Prisma)
Run the following commands to configure your database schema and push changes:
```bash
npx prisma generate
npx prisma db push
```

### 5. Running the Application
```bash
npm run dev
```

---

## 📁 Folder Structure Guide

We abide by a feature-driven, strictly modularized folder structure to separate concerns and easily identify where domain logic lives:

```text
/app
  /(dashboard)        # Authenticated UI routes (Dashboard, Todos, Workouts, Blueprints)
  /api               # Next.js Route Handlers (Separated by resource, e.g. /api/todos, /api/auth)
  /auth              # Public authentication pages (Login, Register)
  layout.tsx         # Global Root Layout
  page.tsx           # Landing Page

/components
  /ui                # Dumb/Shared atomic components (Buttons, Inputs, Modals, Badges)
  /dashboard         # Complex View/Page components solely for Dashboard
  /shared            # Globally shared layouts (Nav, Footers, Sidebar)
  /providers         # Context providers (NextAuth, XpProvider, ThemeProvider)

/features            # Domain-Specific Module Groupings (Follows Single Responsibility)
  /todos             # Anything heavily tied to business subdomains
  /analytics
  /ai-goals

/lib                 # Pure functions, utilities, singletons, logic 
  prisma.ts          # Database Singleton
  constants.ts       # Global Application Constants & Magic Strings (Centralized!)
  /utils             # Formatting logic, visual helpers (e.g., forest.ts)

/prisma              # Database Schema & Migrations
```

---

## 📐 SOLID Principles & LLD Architecture Rules

To maintain high maintainability across the system, this application mandates strict adherence to **SOLID principles** during development:

### 1. Single Responsibility Principle (SRP)
*   **Rule**: A class, component, or file should have only one reason to change.
*   **Implementation**: 
    - Complex interfaces are broken down into logical sub-components (e.g., instead of one massive `LifeArchitectOverview.tsx`, logic like computing the Forest Tree size and emoji strings is delegated to `lib/utils/forest.ts`).
    - API endpoints avoid mingling data formatting logic with data fetching logic where possible.
    
### 2. Open/Closed Principle (OCP)
*   **Rule**: Entities should be open for extension but closed for modification.
*   **Implementation**: 
    - Centralization of configuration data like `KNOWN_ROUTES` inside `lib/constants.ts` makes adding new routes seamless—we just extend the array without restructuring navigation conditional checks in `nav.tsx` or `middleware.ts`.
    - Components use composition (`children`) and functional configurations mapping to dynamic inputs.

### 3. Liskov Substitution Principle (LSP)
*   **Rule**: Objects should be replaceable with instances of their subtypes without altering the correctness of the program.
*   **Implementation**: 
    - Throughout our React ecosystem, we heavily utilize polymorphic TS interfaces. Shared UI components (like atomic `Card` or `Badge`) expect robust baseline prop definitions so standard HTML attributes behave seamlessly without unexpectedly breaking underlying layouts.

### 4. Interface Segregation Principle (ISP)
*   **Rule**: No client should be forced to depend on methods it does not use.
*   **Implementation**: 
    - We divide monolithic state data so components only receive the specific properties they require (e.g., instead of passing an entire deeply nested `user` object containing API Keys and auth info into a tooltip, we pass destructured primitives like `treeTaskCount` down to children like `TreeMini`).

### 5. Dependency Inversion Principle (DIP)
*   **Rule**: High-level modules should not depend on low-level modules. Both should depend on abstractions.
*   **Implementation**: 
    - Database integration logic relies on a singular `prisma.ts` exported client. If we swap DB adapters, the controller endpoints do not require massive rewrites.
    - We use custom hooks (e.g., `useXp()`) to furnish business context and data to front-end components instead of forcing direct coupling UI code and backend REST queries.

> **Development Rule of Thumb**: Keep the system simple, cohesive, and easy to trace. Centralize shared constants, reuse logic functions inside `lib`, and strictly maintain pure, single-purpose components.
