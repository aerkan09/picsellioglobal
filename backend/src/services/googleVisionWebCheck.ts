/**
 * Google Cloud Vision API — web detection: check if image exists on the internet.
 * Used to detect stolen or stock images. Only extends image verification; does not modify existing modules.
 */

const VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY || process.env.GOOGLE_CLOUD_VISION_API_KEY || ''
const VISION_URL = 'https://vision.googleapis.com/v1/images:annotate'

export type WebCheckResult = {
  foundOnWeb: boolean
  warning?: string
  error?: string
}

const STOCK_WARNING = 'Bu görsel internetten alınmış olabilir.'

async function imageToBase64(imageInput: string): Promise<string> {
  if (imageInput.startsWith('data:')) {
    const base64 = imageInput.replace(/^data:image\/\w+;base64,/, '')
    return base64
  }
  const res = await fetch(imageInput)
  if (!res.ok) throw new Error(`Fetch image failed: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  return buf.toString('base64')
}

/**
 * Check if the image appears on the web (stock / stolen). Uses Vision API WEB_DETECTION.
 * If full matching images or pages with matching images are found, returns foundOnWeb: true and warning message.
 */
export async function checkImageExistsOnWeb(imageInput: string): Promise<WebCheckResult> {
  if (!VISION_API_KEY) {
    return { foundOnWeb: false }
  }
  try {
    const content = await imageToBase64(imageInput)
    const body = {
      requests: [
        {
          image: { content },
          features: [{ type: 'WEB_DETECTION', maxResults: 20 }],
        },
      ],
    }
    const res = await fetch(`${VISION_URL}?key=${VISION_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = (await res.json()) as {
      responses?: Array<{
        webDetection?: {
          fullMatchingImages?: unknown[]
          pagesWithMatchingImages?: unknown[]
          visuallySimilarImages?: unknown[]
        }
        error?: { message?: string }
      }>
      error?: { message?: string }
    }
    if (!res.ok) {
      return { foundOnWeb: false, error: data.error?.message || res.statusText }
    }
    const first = data.responses?.[0]
    if (first?.error) {
      return { foundOnWeb: false, error: first.error.message }
    }
    const web = first?.webDetection
    const fullMatches = web?.fullMatchingImages?.length ?? 0
    const pagesWithMatches = web?.pagesWithMatchingImages?.length ?? 0
    const foundOnWeb = fullMatches > 0 || pagesWithMatches > 0
    return {
      foundOnWeb,
      ...(foundOnWeb && { warning: STOCK_WARNING }),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { foundOnWeb: false, error: message }
  }
}
