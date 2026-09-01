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
      // El filtro por rol vive en la propia tabla de usuarios: tenerlo también
      // aquí alargaba la barra con seis entradas que hacen lo mismo.
      items.push({
        label: 'Usuarios',
        icon: 'i-lucide-users',
        defaultOpen: true,
        children: [
          link('Todos los usuarios', 'i-lucide-list', '/dashboard/usuarios', true),
          link('Crear usuario', 'i-lucide-user-plus', '/dashboard/usuarios/nuevo'),
        ],
      })
      items.push(link('Cursos', 'i-lucide-book-open', '/dashboard/cursos'))
    }

    if (current === 'superusuario') {
      items.push({
        label: 'Servicios',
        icon: 'i-lucide-package',
        defaultOpen: true,
        children: [
          link('Catálogo', 'i-lucide-box', '/dashboard/servicios', true),
          link('Contratados', 'i-lucide-route', '/dashboard/servicios-contratados'),
        ],
      })
    }
    else if (current === 'tutor') {
      // El tutor no administra el catálogo, así que sólo ve lo contratado y no
      // necesita un grupo desplegable para una única entrada.
      items.push(link('Servicios contratados', 'i-lucide-route', '/dashboard/servicios-contratados'))
    }

    if (current === 'cliente') {
      items.push(link('Mis servicios', 'i-lucide-package-check', '/dashboard/mis-servicios'))
    }

    // El catálogo es lo que un afiliado ofrece, así que le da una entrada
    // propia; al resto de no-staff le sirve para consultar qué se vende.
    if (current && !isStaff(current)) {
      items.push(link('Servicios', 'i-lucide-package', '/dashboard/servicios-catalogo'))
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
      items.push(link('Solicitudes de retiro', 'i-lucide-hand-coins', '/dashboard/retiros'))
    }

    return items
  })

  const account = computed<NavigationMenuItem[]>(() => [
    link('Mi perfil', 'i-lucide-user', '/dashboard/perfil'),
  ])

  return { main, referrals, account }
}
