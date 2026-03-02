export interface Customer {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export interface UpdateCustomerData extends CreateCustomerData {}
