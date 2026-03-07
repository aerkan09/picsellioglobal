#!/usr/bin/env node

import { execSync } from "child_process"
import fs from "fs"
import path from "path"

console.log("🚀 Picsellio PRO kuruluyor...")

// Eski frontend varsa kaldır (Next.js ile değiştirilecek)
const frontendDir = path.join(process.cwd(), "frontend")
if (fs.existsSync(frontendDir)) {
  console.log("📁 Eski frontend kaldırılıyor...")
  fs.rmSync(frontendDir, { recursive: true })
}

execSync("npx create-next-app@latest frontend --ts --tailwind --app --eslint --yes",{stdio:"inherit"})

fs.mkdirSync("backend",{recursive:true})
fs.mkdirSync("database",{recursive:true})

console.log("📦 Backend kuruluyor...")

execSync("cd backend && npm init -y",{stdio:"inherit"})
execSync("cd backend && npm install fastify prisma @prisma/client stripe openai",{stdio:"inherit"})

console.log("✅ Kurulum tamamlandı")
