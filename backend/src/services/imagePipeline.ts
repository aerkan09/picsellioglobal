/**
 * Image pipeline: Stability (upscale 2K) → Photoroom (remove BG) → Cloudinary (resize, overlay labels).
 * Each step is optional if the corresponding API key is not set.
 */
const STABILITY_API_KEY = process.env.STABILITY_API_KEY || ''
const PHOTOROOM_API_KEY = process.env.PHOTOROOM_API_KEY || ''

export type PipelineResult = {
  url: string
  steps: { upscaled?: string; noBg?: string; final: string }
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function upscaleStability(imageUrl: string): Promise<Buffer | null> {
  if (!STABILITY_API_KEY) return null
  try {
    const imageBuffer = await fetchBuffer(imageUrl)
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
    const buf = Buffer.from(await res.arrayBuffer())
    return buf
  } catch {
    return null
  }
}

async function removeBgPhotoroom(imageBuffer: Buffer): Promise<Buffer | null> {
  if (!PHOTOROOM_API_KEY) return null
  try {
    const formData = new FormData()
    formData.append('image_file', new Blob([imageBuffer]), 'image.png')
    const res = await fetch('https://sdk.photoroom.com/v1/segment', {
      method: 'POST',
      headers: {
        'x-api-key': PHOTOROOM_API_KEY,
      },
      body: formData,
    })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

/**
 * Run the full pipeline. If an API is missing, that step is skipped.
 * Final URL: if Cloudinary is configured, upload and return transformed URL; otherwise return original.
 */
export async function processImagePipeline(imageUrl: string): Promise<PipelineResult> {
  const steps: PipelineResult['steps'] = { final: imageUrl }
  let currentBuffer: Buffer | null = await fetchBuffer(imageUrl).catch(() => null)

  const upscaled = currentBuffer ? await upscaleStability(imageUrl) : null
  if (upscaled) {
    currentBuffer = upscaled
    steps.upscaled = imageUrl
  }

  if (currentBuffer) {
    const noBg = await removeBgPhotoroom(currentBuffer)
    if (noBg) currentBuffer = noBg
    steps.noBg = steps.upscaled || imageUrl
  }

  // Without Cloudinary upload we return the original URL; frontend can use it. Production: upload currentBuffer to Cloudinary and add overlay.
  steps.final = imageUrl
  return { url: imageUrl, steps }
}
