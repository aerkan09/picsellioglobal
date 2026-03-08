/**
 * Shopier payment integration (Turkey).
 * Builds signed params for redirect to Shopier payment page.
 * Callback verification and ListingCredit creation in routes/shopier.ts
 */
import crypto from 'crypto'

const SHOPIER_API_KEY = process.env.SHOPIER_API_KEY || ''
const SHOPIER_API_SECRET = process.env.SHOPIER_API_SECRET || ''
const SHOPIER_BASE_URL = process.env.SHOPIER_BASE_URL || 'https://www.shopier.com/pay'

export type ShopierCheckoutParams = {
  planSlug: string
  userId: string
  userEmail: string
  userName: string
  userPhone: string
  orderId: string
  amountLira: number // e.g. 100 or 250
  productName: string
  callbackUrl: string
  successUrl: string
}

function buildSignature(params: Record<string, string>): string {
  const sortedKeys = Object.keys(params).sort()
  const str = sortedKeys.map((k) => params[k]).join('')
  return crypto.createHmac('sha256', SHOPIER_API_SECRET).update(str).digest('hex')
}

export function getShopierPaymentUrl(params: ShopierCheckoutParams): { url: string; formData: Record<string, string> } | null {
  if (!SHOPIER_API_KEY || !SHOPIER_API_SECRET) return null
  const amountStr = params.amountLira.toFixed(2)
  const formData: Record<string, string> = {
    API_key: SHOPIER_API_KEY,
    website_index: '1',
    order_id: params.orderId,
    total_order_value: amountStr,
    product_name: params.productName,
    buyer_name: params.userName,
    buyer_account_age: '0',
    buyer_phone_number: params.userPhone.replace(/\D/g, '').slice(-10) || '5550000000',
    billing_address: 'N/A',
    billing_city: 'Istanbul',
    billing_country: 'Turkey',
    billing_postcode: '34000',
    shipping_address: 'N/A',
    shipping_city: 'Istanbul',
    shipping_country: 'Turkey',
    shipping_postcode: '34000',
    callback_url: params.callbackUrl,
    success_url: params.successUrl,
  }
  const signature = buildSignature(formData)
  formData.signature = signature
  return { url: SHOPIER_BASE_URL, formData }
}

export function verifyShopierCallback(payload: Record<string, unknown>): boolean {
  const received = (payload.signature as string) || ''
  const copy = { ...payload }
  delete (copy as Record<string, unknown>).signature
  const sortedKeys = Object.keys(copy).sort()
  const str = sortedKeys.map((k) => String((copy as Record<string, unknown>)[k] ?? '')).join('')
  const expected = crypto.createHmac('sha256', SHOPIER_API_SECRET).update(str).digest('hex')
  return received === expected
}
