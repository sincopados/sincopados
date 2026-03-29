import type { ComputedRef, MaybeRef } from 'vue'

type ComponentProps<T> = T extends new(...args: any) => { $props: infer P } ? NonNullable<P>
  : T extends (props: infer P, ...args: any) => any ? P
  : {}

declare module 'nuxt/app' {
  interface NuxtLayouts {
    "dashboard-layout": ComponentProps<typeof import("/home/usurio/Documentos/Nuxt/sincopados/app/layouts/dashboard-layout.vue").default>
    default: ComponentProps<typeof import("/home/usurio/Documentos/Nuxt/sincopados/app/layouts/default.vue").default>
    "login-layout": ComponentProps<typeof import("/home/usurio/Documentos/Nuxt/sincopados/app/layouts/login-layout.vue").default>
  }
  export type LayoutKey = keyof NuxtLayouts extends never ? string : keyof NuxtLayouts
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false> | {
      [K in LayoutKey]: {
        name?: MaybeRef<K | false> | ComputedRef<K | false>
        props?: NuxtLayouts[K]
      }
    }[LayoutKey]
  }
}