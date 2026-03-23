import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      business: string
    }
  }
  interface User {
    business?: string
  }
}