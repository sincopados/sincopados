import type { NavigationMenuItem } from '@nuxt/ui'
import type { UserRole } from '~/types/db'

/**
 * Menú lateral por tipo de usuario. Es sólo la capa de presentación: cada ruta
 * vuelve a comprobar el rol en `middleware/role.ts` y la RLS es la última
 * palabra sobre los datos.
 */
export const useDashboardNav = () => {
  const { role } = useProfile()
  const localePath = useLocalePath()

  const link = (label: string, icon: string, to: string, exact = false): NavigationMenuItem => ({
    label,
    icon,
    to: localePath(to),
    exact,
  })

  const main = computed<NavigationMenuItem[]>(() => {
    const current = role.value as UserRole | null
    const items: NavigationMenuItem[] = [link('Inicio', 'i-lucide-house', '/dashboard', true)]

    if (current === 'superusuario' || current === 'tutor') {
      items.push({
        label: 'Usuarios',
        icon: 'i-lucide-users',
        defaultOpen: true,
        children: [
          link('Todos los usuarios', 'i-lucide-list', '/dashboard/usuarios', true),
          link('Crear usuario', 'i-lucide-user-plus', '/dashboard/usuarios/nuevo'),
          link('Clientes', 'i-lucide-briefcase', '/dashboard/usuarios/rol/cliente'),
          link('Alumnos', 'i-lucide-graduation-cap', '/dashboard/usuarios/rol/alumno'),
          link('Afiliados', 'i-lucide-handshake', '/dashboard/usuarios/rol/afiliado'),
          ...(current === 'superusuario'
            ? [
                link('Tutores', 'i-lucide-user-cog', '/dashboard/usuarios/rol/tutor'),
                link('Superusuarios', 'i-lucide-shield', '/dashboard/usuarios/rol/superusuario'),
              ]
            : []),
        ],
      })
      items.push(link('Cursos', 'i-lucide-book-open', '/dashboard/cursos'))
    }

    if (current === 'superusuario') {
      items.push(link('Servicios', 'i-lucide-package', '/dashboard/servicios'))
    }

    if (current === 'cliente') {
      items.push(link('Mis servicios', 'i-lucide-package-check', '/dashboard/mis-servicios'))
    }

    if (current === 'alumno') {
      items.push(link('Mis cursos', 'i-lucide-book-open-check', '/dashboard/mis-cursos'))
    }

    return items
  })

  const referrals = computed<NavigationMenuItem[]>(() => {
    const items = [link('Mis referidos', 'i-lucide-share-2', '/dashboard/referidos', true)]

    if (role.value === 'superusuario') {
      items.push(link('Referidos globales', 'i-lucide-globe', '/dashboard/referidos/global'))
    }

    return items
  })

  const account = computed<NavigationMenuItem[]>(() => [
    link('Mi perfil', 'i-lucide-user', '/dashboard/perfil'),
  ])

  return { main, referrals, account }
}
