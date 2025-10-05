# Project: Lucky 100 Raffle (Improved Context)

## 1. Project Overview

Lucky 100 Raffle is a modern, full-stack web application built with Next.js (App Router) and TypeScript, enabling users to create, manage, and join 100-slot raffles with real-time interactivity. It uses a serverless backend via Firebase for authentication, data storage, and secure mutations, while integrating Google's Genkit AI for generating raffle content from user prompts. The design prioritizes secure, live updates across users, responsive UI, and atomic operations for fairness.

### Core Features (Requirements Perspective)
- Real-time 100-slot raffle boards with interactive participation.
- User authentication/authorization for organizers and participants.
- Live synchronization of slot status (available, paid, reserved, winning, losing) via Firestore listeners.
- AI-generated raffle names, descriptions, and terms based on prize inputs.
- Secure random winner selection with Firestore transactions.
- Dashboard with analytics (e.g., participation metrics, revenue tracking).
- Responsive, accessible UI with animations and color-coded visuals.
- Form validation and error handling for robust user input.

## 2. Key Technologies & Stack

- **Framework**: Next.js 14+ (App Router).
- **Language**: TypeScript.
- **Backend (Serverless)**: Firebase.
  - **Authentication**: Firebase Authentication.
  - **Database**: Firestore with real-time listeners and transactions.
  - **Admin SDK**: `firebase-admin` for server-side security.
- **Styling**: Tailwind CSS with custom warm/terrestrial palette.
- **UI Components**: shadcn/ui, Radix UI primitives; Framer Motion for animations.
- **AI**: Genkit (`@genkit-ai/googleai`) with Gemini-1.5-flash model.
- **Forms**: React Hook Form + Zod for validation.
- **State Management**: React Context (e.g., AuthProvider) and hooks.
- **Other Libraries**: Lucide-react (icons), network utilities as needed.

## 3. Project Structure

The structure follows Next.js conventions with clear separation for scalability:

```
src/
├── app/                    # Routes, layouts, and Server Actions
│   ├── (app)/             # Authenticated routes (dashboard, raffle/[id])
│   ├── (auth)/            # Login/signup routes
│   ├── actions.ts         # Server Actions for mutations
│   └── api/               # Optional API endpoints
├── components/            # Reusable components
│   ├── ui/                # Base shadcn/Radix components
│   ├── layout/            # Headers, footers, modals
│   ├── dashboard/         # Analytics and overview components
│   └── raffle/            # Board, slots, and management UI
├── lib/                   # Core utilities and configs
│   ├── firebase.ts        # Client-side Firebase SDK init
│   ├── firebase-admin.ts  # Server-side Admin SDK init
│   ├── firestore.ts       # Read/write functions for Firestore
│   ├── utils.ts           # General helpers (e.g., token verification)
│   └── definitions.ts     # Type defs (Raffle, RaffleSlot models)
├── context/               # Global state (auth-context.tsx)
├── ai/                    # Genkit AI setup
│   ├── flows/             # AI flows (generate-raffle-details.ts)
│   ├── dev.ts             # Local AI dev server
│   └── genkit.ts          # Genkit config and prompts
├── types/                 # Additional TypeScript types
└── public/                # Static assets (images, icons)
```

## 4. Key Configuration Files

- `next.config.ts`: Image optimization, remote patterns for Firebase storage.
- `tailwind.config.ts`: Custom colors, themes, and plugins.
- `tsconfig.json`: Path aliases (@/* → src/*), strict typing.
- `firebase.json`: Hosting rewrites, Firestore rules for security.
- `package.json`: Dependencies/scripts; includes ESLint, TypeScript configs.

## 5. Environment Variables

Create `.env.local` with these for Firebase integration:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- Server-side Admin SDK credentials (e.g., service account JSON).

## 6. Building, Running, and Development Commands

- **Install**: `npm install`
- **Dev Mode**: `npm run dev` (Next.js on http://localhost:9002 with Turbopack).
- **AI Dev**: `npm run genkit:dev` (Local AI testing); `npm run genkit:watch` (With file watching).
- **Build/Prod**: `npm run build` then `npm run start`.
- **Lint/Typecheck**: `npm run lint` (ESLint); `npm run typecheck` (TypeScript).

## 7. Color Palette (UI Requirements)

Warm/terrestrial scheme for visual clarity:
- Accent: #A4243B (strong red).
- Background: #D8C99B (light earth).
- Toolbar: #D8973C (warm gold).
- Other: #BD632F (orange), #273E47 (dark blue).
- Slots: Available (#8B9A46 green), Paid (#5D7CA6 blue), Reserved (#C17D4E orange), Winning (#E6B422 yellow), Losing (#7A6B5D gray).

## 8. Architecture & Flows (Context/Prompts Engineering)

### Data & Authentication Flow (Guided Steps)
1. **Auth Setup**: `AuthProvider` in `auth-context.tsx` uses `onAuthStateChanged` for session state. Client gets `idToken` for secure calls.
2. **Read Operations**: Client components (e.g., raffle page) use `onSnapshot` for real-time Firestore subscriptions, updating UI instantly.
3. **Write Operations**: Form submits to Server Action in `actions.ts`, sending `idToken` and data.
4. **Server Verification**: Action verifies `idToken` via `firebase-admin.verifyIdToken()`, authorizing user.
5. **Mutation Execution**: Use `getAdminDb()` for Firestore writes/transactions (e.g., slot updates, winner selection).
6. **Cache/Revalidation**: Call `revalidatePath()` to refresh Next.js cache.
7. **Error Handling**: Zod validates inputs; Firestore rules enforce access.

### AI Integration (Prompts Engineering)
In `generate-raffle-details.ts`:
- Define prompt with `ai.definePrompt`: Takes user prize description; instructs Gemini to output JSON {name, description, terms}.
- Wrap in `generateRaffleDetailsFlow` for reusable calls from Server Actions.
- Enables prompt-based generation: E.g., "Input: Luxury watch → Output: Structured raffle details."

This architecture ensures secure, real-time ops while providing clear prompts for AI and requirements for features, facilitating codebase extension or debugging.