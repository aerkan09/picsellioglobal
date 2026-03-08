/**
 * AI-powered image processing pipeline for advertisement (listing) images.
 * Order: 1) Photoroom remove BG → 2) Stability upscale → 3) Cloudinary enhance → 4) Overlay (title + price) → 5) Save to public/uploads.
 * Each step is optional if the corresponding API key is not set; pipeline still runs and saves.
 */
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import sharp from 'sharp'

const PHOTOROOM_API_KEY = process.env.PHOTOROOM_API_KEY || ''
const STABILITY_API_KEY = process.env.STABILITY_API_KEY || ''
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || ''
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || ''
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || ''
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'public', 'uploads')
const UPLOADS_BASE_URL = process.env.UPLOADS_BASE_URL || '' // e.g. http://localhost:4000 or https://yourapp.com

export type ListingPipelineOptions = {
  title: string
  price: number // in cents or TL units; displayed as ₺
}

export type ListingPipelineResult = {
  success: boolean
  localPath?: string
  publicUrl?: string
  error?: string
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/** Step 1: Remove background (Photoroom) */
async function removeBgPhotoroom(imageBuffer: Buffer): Promise<Buffer | null> {
  if (!PHOTOROOM_API_KEY) return null
  try {
    const formData = new FormData()
    formData.append('image_file', new Blob([imageBuffer]), 'image.png')
    const res = await fetch('https://sdk.photoroom.com/v1/segment', {
      method: 'POST',
      headers: { 'x-api-key': PHOTOROOM_API_KEY },
      body: formData,
    })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

/** Step 2: Upscale (Stability AI) */
async function upscaleStability(imageBuffer: Buffer): Promise<Buffer | null> {
  if (!STABILITY_API_KEY) return null
  try {
    const formData = new FormData()
    formData.append('image', new Blob([imageBuffer]), 'image.png')
    formData.append('width', '2048')
    formData.append('height', '2048')
    const res = await fetch('https://api.stability.ai/v2beta/stable-image/upscale/conservative', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STABILITY_API_KEY}`,
        Accept: 'image/*',
      },
      body: formData,
    })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

/** Step 3: Cloudinary automatic optimization (brightness, contrast, color) */
async function enhanceCloudinary(imageBuffer: Buffer): Promise<Buffer | null> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return null
  try {
    const { v2: cloudinary } = await import('cloudinary')
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    })
    const id = `listing-${randomUUID()}`
    const base64 = imageBuffer.toString('base64')
    const dataUri = `data:image/png;base64,${base64}`
    const result = await cloudinary.uploader.upload(dataUri, { public_id: id })
    const url = result?.secure_url
    if (!url) return null
    // Fetch with e_improve (brightness, contrast, color)
    const enhanceUrl = url.replace(
      `/upload/`,
      `/upload/e_improve,q_auto:good/`
    )
    const buf = await fetchBuffer(enhanceUrl)
    return buf
  } catch {
    return null
  }
}

/** Step 4: Add overlay text — price (₺X) and title (e.g. AHŞAP MASA) */
async function addOverlay(imageBuffer: Buffer, options: ListingPipelineOptions): Promise<Buffer> {
  const priceFormatted = `₺${Number(options.price) >= 100 ? (options.price / 100).toFixed(0) : options.price}`
  const titleUpper = (options.title || '').toUpperCase().slice(0, 80)
  const meta = await sharp(imageBuffer).metadata()
  const width = meta.width || 800
  const height = meta.height || 800
  const padding = Math.round(Math.min(width, height) * 0.04)
  const fontSizePrice = Math.round(Math.min(width, height) * 0.08)
  const fontSizeTitle = Math.round(Math.min(width, height) * 0.06)
  const lineHeight = fontSizeTitle + 4
  const boxHeight = lineHeight * 2 + padding * 2
  const svg = `
<svg width="${width}" height="${boxHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)"/>
  <text x="${width / 2}" y="${padding + fontSizePrice}" text-anchor="middle" fill="white" font-size="${fontSizePrice}" font-weight="bold" font-family="Arial,sans-serif">${escapeXml(priceFormatted)}</text>
  <text x="${width / 2}" y="${padding + fontSizePrice + lineHeight}" text-anchor="middle" fill="white" font-size="${fontSizeTitle}" font-weight="bold" font-family="Arial,sans-serif">${escapeXml(titleUpper)}</text>
</svg>
  `.trim()
  const overlayBuffer = Buffer.from(svg)
  const composed = await sharp(imageBuffer)
    .composite([{
      input: overlayBuffer,
      top: height - boxHeight,
      left: 0,
    }])
    .png()
    .toBuffer()
  return composed
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Step 5: Save to public/uploads */
async function saveToUploads(buffer: Buffer): Promise<{ localPath: string; publicUrl: string }> {
  await mkdir(UPLOADS_DIR, { recursive: true })
  const filename = `${randomUUID()}.png`
  const localPath = path.join(UPLOADS_DIR, filename)
  await writeFile(localPath, buffer)
  const publicUrl = UPLOADS_BASE_URL
    ? `${UPLOADS_BASE_URL.replace(/\/$/, '')}/uploads/${filename}`
    : `/uploads/${filename}`
  return { localPath, publicUrl }
}

/**
 * Run the full advertisement image pipeline.
 * Called when a listing image is uploaded; runs in order: remove BG → upscale → enhance → overlay → save.
 */
export async function processListingImagePipeline(
  imageUrl: string,
  options: ListingPipelineOptions
): Promise<ListingPipelineResult> {
  try {
    let buffer: Buffer | null = await fetchBuffer(imageUrl).catch(() => null)
    if (!buffer) return { success: false, error: 'Failed to fetch image' }

    // Step 1: Background removal (Photoroom)
    const noBg = await removeBgPhotoroom(buffer)
    if (noBg) buffer = noBg

    // Step 2: Upscale (Stability AI)
    const upscaled = await upscaleStability(buffer)
    if (upscaled) buffer = upscaled

    // Step 3: Cloudinary enhancement
    const enhanced = await enhanceCloudinary(buffer)
    if (enhanced) buffer = enhanced

    // Step 4: Overlay (title + price)
    buffer = await addOverlay(buffer, options)

    // Step 5: Save to public/uploads
    const { localPath, publicUrl } = await saveToUploads(buffer)

    return { success: true, localPath, publicUrl }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}
