#!/bin/sh
set -e

# Install deps so node_modules volume has all packages (e.g. after adding react-router-dom)
echo "Installing dependencies..."
bun install --frozen-lockfile || bun install
echo "Dependencies ready."

# Wait for Convex backend to be ready (same network as backend service)
# Use Bun for the check — the app image has no curl
echo "Waiting for Convex backend..."
until bun -e "const r=await fetch('http://backend:3210/version'); process.exit(r.ok?0:1)" 2>/dev/null; do
  echo "  backend not ready, retrying in 2s..."
  sleep 2
done
echo "Convex backend is up."

# Push Convex functions and watch (background); uses CONVEX_SELF_HOSTED_URL + CONVEX_SELF_HOSTED_ADMIN_KEY from env.
# Run vite directly — do not use `bun run dev` (that starts concurrently + `convex dev --local`, which conflicts with self-hosted Docker).
echo "Starting convex dev..."
bunx convex dev &

# Start Vite dev server (foreground so container stays up); port/host from vite.config.ts
echo "Starting Vite..."
exec bunx vite --host
