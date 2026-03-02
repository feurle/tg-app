export interface AuthUser {
  login: string
  firstName: string | null
  lastName: string | null
  email: string
  authorities: string[]
}
