# NetSellerSheet.com

A premium, high-conversion net seller sheet calculator for homeowners.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Language**: TypeScript

## Key Logic
- `lib/calculator.ts`: Contains the `calculateNetProceeds` engine.
- `components/features/MainCalculator.tsx`: The main orchestrator (Landing -> Lead Capture -> Results).

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000)

## Deployment
This project is ready for Vercel.
1. Run `npx vercel` (if Vercel CLI is installed)
2. Or push to GitHub and import into Vercel.

## Configuration
- Update defaults in `lib/calculator.ts`.
- Connect your email provider (Resend, Supabase, etc.) in `handleEmailSubmit` within `MainCalculator.tsx`.
