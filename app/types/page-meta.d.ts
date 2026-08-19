import type { UserRole } from './db'

declare module 'vue-router' {
  interface RouteMeta {
    /** Roles autorizados a ver la página. Lo aplica `middleware/role.ts`. */
    roles?: UserRole[]
  }
}

export {}
