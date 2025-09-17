# Project: Lucky 100 Raffle

## 1. Project Overview

This is a modern web application named "Lucky 100 Raffle" built with Next.js (App Router) and TypeScript. It allows users to create, manage, and participate in 100-slot raffles.

The application features a full "serverless" backend implementation using **Firebase**. **Firebase Authentication** handles user registration and login, while **Firestore** is used for all data persistence, including real-time updates on the raffle boards.

A key feature is the use of Google's Genkit AI to automatically generate compelling names, descriptions, and terms for new raffles based on a user's prize description.

## 2. Key Technologies

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Backend (as a Service)**: Firebase (Firestore for database, Firebase Auth for authentication)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **AI**: Genkit (`@genkit-ai/googleai`)
- **Forms**: React Hook Form with Zod for validation
- **State Management**: React Context (`AuthProvider`) and React Hooks.

## 3. Building and Running the Project

- **Install dependencies:**
  ```bash
  npm install
  ```

- **Set up environment variables:**
  * Create a `.env.local` file and add your Firebase project credentials.

- **Run the main web application (development mode):**
  ```bash
  npm run dev
  ```
  *This starts the Next.js development server, typically on `http://localhost:9002`.*

- **Run the AI development service:**
  ```bash
  npm run genkit:dev
  ```

## 4. Development Conventions & Architecture

- **Project Structure**: The code follows the standard Next.js App Router convention.
    - `src/app/`: Contains all application routes and Server Actions (`actions.ts`).
    - `src/components/`: Reusable React components.
    - `src/lib/`: Core logic and configuration.
        - `firebase.ts`: Firebase SDK initialization.
        - `firestore.ts`: Functions for querying the Firestore database (e.g., `getRafflesForUser`).
        - `definitions.ts`: TypeScript type definitions for data models.
    - `src/context/`: Global state management using React Context (e.g., `auth-context.tsx`).
- **Data Layer**: The application's data layer is implemented in `src/lib/firestore.ts` and within the Server Actions in `src/app/actions.ts`. All data operations (CRUD) are performed against Firestore. The mock data file `src/lib/data.ts` is deprecated.
- **Authentication**: Handled via Firebase Authentication on the client-side, with session state managed globally through `AuthProvider`.
- **Real-time Updates**: The raffle detail page (`/raffle/[id]`) uses Firestore's `onSnapshot` listener to get real-time updates for the slots, providing a dynamic user experience.
