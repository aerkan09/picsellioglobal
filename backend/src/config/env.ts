/**
 * Centralized environment configuration.
 * All sensitive keys and config MUST come from process.env (set in .env file).
 * Do not hardcode any secrets in source code.
 */

function env(key: string, defaultValue = ''): string {
  return (process.env[key] ?? defaultValue).trim()
}

export const config = {
  // Site
  siteName: env('SITE_NAME', 'PICSELLIO'),
  siteUrl: env('SITE_URL', 'https://picsellioglobal.com'),

  // Admin (used for seed / first-time setup; admin user is stored in DB with role ADMIN)
  adminUsername: env('ADMIN_USERNAME'),
  adminPassword: env('ADMIN_PASSWORD'),

  // Server
  port: Number(process.env.PORT) || 4000,
  frontendUrl: env('FRONTEND_URL', 'http://localhost:3000'),
  apiUrl: env('API_URL', process.env.BACKEND_URL || 'http://localhost:4000'),
  jwtSecret: env('JWT_SECRET', 'change-me-in-production'),
  jwtExpiresIn: env('JWT_EXPIRES_IN', '7d'),

  // Database – Prisma reads DATABASE_URL from env
  get databaseUrl(): string {
    return env('DATABASE_URL')
  },

  // Shopier
  shopierApiKey: env('SHOPIER_API_KEY'),
  shopierApiSecret: env('SHOPIER_API_SECRET'),
  shopierCallbackUrl: env('SHOPIER_CALLBACK_URL'),

  // OpenAI
  openaiApiKey: env('OPENAI_API_KEY'),

  // Cloudinary
  cloudinaryCloudName: env('CLOUDINARY_CLOUD_NAME'),
  cloudinaryApiKey: env('CLOUDINARY_API_KEY'),
  cloudinaryApiSecret: env('CLOUDINARY_API_SECRET'),

  // Photoroom
  photoroomApiKey: env('PHOTOROOM_API_KEY'),

  // Stability AI
  stabilityApiKey: env('STABILITY_API_KEY'),

  // Google Vision
  googleVisionApiKey: env('GOOGLE_VISION_API_KEY') || env('GOOGLE_CLOUD_VISION_API_KEY'),

  // SMTP
  smtpHost: env('SMTP_HOST'),
  smtpPort: env('SMTP_PORT'),
  smtpUser: env('SMTP_USER'),
  smtpPass: env('SMTP_PASS'),
} as const
