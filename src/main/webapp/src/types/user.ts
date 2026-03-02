export interface User {
  id: number
  login: string
  email: string
  firstName: string | null
  lastName: string | null
  activated: boolean
  langKey: string
  imageUrl: string | null
  authorities: string[]
  createdDate: string
  createdBy: string
  lastModifiedDate: string
  lastModifiedBy: string | null
}

export interface CreateUserData {
  login: string
  password: string
  email: string
  firstName?: string
  lastName?: string
  langKey?: string
  imageUrl?: string
  authorities?: string[]
}

export interface UpdateUserData {
  email: string
  password?: string
  firstName?: string
  lastName?: string
  langKey?: string
  imageUrl?: string
  activated?: boolean
  authorities?: string[]
}
