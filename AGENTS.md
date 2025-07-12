# Agent Guidelines for Electron Monorepo

## Build/Lint/Test Commands
- **Root commands**: `npm run qlippy`, `npm run qommand` (dev), `npm run qlippy-dev`, `npm run qommand-dev` (quick build)
- **Frontend (qlippy-frontend)**: `npm run dev`, `npm run build`, `npm run lint`
- **Backend (qommand-backend)**: `npm run dev`, `npm run start`, `npm run build`, `npm run lint`
- **Testing**: `npm run qlippy-test`, `npm run qommand-test`, or `npm run test -- --app=<appname>` (targets *.test.ts, *.test.tsx files)

## Code Style Guidelines
- **TypeScript**: Use TypeScript with `strict: false` configuration
- **Programming paradigm**: Use functional programming patterns only - classes are ONLY allowed if there is no functional way
- **Imports**: Use workspace dependencies (`workspace:*`), relative imports for local files
- **Naming**: camelCase for variables/functions, PascalCase for components/types, kebab-case for files
- **React**: Use "use client" directive, functional components with hooks
- **Types**: Export types with descriptive names (e.g., `ButtonClickedEventData`)
- **Error handling**: Use async/await pattern, handle errors gracefully
- **Formatting**: ESLint with Prettier, React recommended configs

## Project Structure
- Lerna monorepo with pnpm workspaces
- Applications: `src/applications/` (qlippy-frontend, qommand-backend, etc.)
- Packages: `src/packages/` (common-essentials, frontend-essentials, backend-essentials)
- Use workspace dependencies for internal packages

## Development Notes
- Frontend uses Next.js 15 with Tailwind CSS and React 19
- Backend uses Electron with TypeScript and Express
- No Cursor/Copilot rules found - follow standard TypeScript/React conventions