/**
 * Cloudflare R2 (S3-compatible) storage client.
 * Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME in env.
 */
import { PutObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const bucket = process.env.R2_BUCKET_NAME
const publicUrl = process.env.R2_PUBLIC_URL // e.g. https://pub-xxx.r2.dev or custom domain

export const r2Enabled = !!(accountId && accessKeyId && secretAccessKey && bucket)

const client = r2Enabled
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
      forcePathStyle: true,
    })
  : null

export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType?: string
): Promise<string> {
  if (!client || !bucket) throw new Error('R2 not configured')
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType ?? 'application/octet-stream',
    })
  )
  return publicUrl ? `${publicUrl.replace(/\/$/, '')}/${key}` : `r2://${bucket}/${key}`
}

export async function deleteFromR2(key: string): Promise<void> {
  if (!client || !bucket) throw new Error('R2 not configured')
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}

export function getPublicUrl(key: string): string | null {
  if (!publicUrl) return null
  return `${publicUrl.replace(/\/$/, '')}/${key}`
}
