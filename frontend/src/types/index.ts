export interface Product {
  id: string
  title: string
  subtitle?: string
  description?: string
  handle: string
  thumbnail?: string
  images?: ProductImage[]
  variants: ProductVariant[]
  options: ProductOption[]
  tags?: ProductTag[]
  collection?: ProductCollection
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  title: string
  sku?: string
  prices: ProductVariantPrice[]
  options: ProductVariantOption[]
  inventory_quantity: number
  product_id: string
  created_at: string
  updated_at: string
}

export interface ProductVariantPrice {
  id: string
  currency_code: string
  amount: number
  variant_id: string
}

export interface ProductVariantOption {
  id: string
  value: string
  option_id: string
  variant_id: string
}

export interface ProductOption {
  id: string
  title: string
  values: ProductOptionValue[]
  product_id: string
}

export interface ProductOptionValue {
  id: string
  value: string
  option_id: string
}

export interface ProductImage {
  id: string
  url: string
  created_at: string
  updated_at: string
}

export interface ProductTag {
  id: string
  value: string
}

export interface ProductCollection {
  id: string
  title: string
  handle: string
}

export interface Cart {
  id: string
  items: CartItem[]
  region: Region
  shipping_address?: Address
  billing_address?: Address
  email?: string
  customer_id?: string
  payment_session?: PaymentSession
  shipping_methods: ShippingMethod[]
  subtotal: number
  tax_total: number
  shipping_total: number
  total: number
}

export interface CartItem {
  id: string
  cart_id: string
  variant: ProductVariant
  quantity: number
  unit_price: number
  total: number
}

export interface Region {
  id: string
  name: string
  currency_code: string
  tax_rate: number
  countries: Country[]
}

export interface Country {
  id: string
  name: string
  iso_2: string
  iso_3: string
}

export interface Address {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  country_code: string
  province?: string
  postal_code: string
  phone?: string
}

export interface PaymentSession {
  id: string
  provider_id: string
  data: Record<string, unknown>
  status: string
}

export interface ShippingMethod {
  id: string
  shipping_option_id: string
  price: number
  data: Record<string, unknown>
}

export interface Order {
  id: string
  display_id: number
  cart_id: string
  customer_id: string
  email: string
  billing_address: Address
  shipping_address: Address
  items: CartItem[]
  shipping_methods: ShippingMethod[]
  payment_status: string
  fulfillment_status: string
  status: string
  subtotal: number
  tax_total: number
  shipping_total: number
  total: number
  created_at: string
  updated_at: string
}
