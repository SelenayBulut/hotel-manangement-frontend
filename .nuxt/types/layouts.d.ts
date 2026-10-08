import type { ComputedRef, MaybeRef } from "vue";
import type { ComponentProps } from "../../node_modules/vue-component-type-helpers/index.js";

declare module 'nuxt/app' {
  interface NuxtLayouts {
    admin: ComponentProps<typeof import("C:/Projects/hotel-frontend-nuxt/app/layouts/admin.vue").default>
    customer: ComponentProps<typeof import("C:/Projects/hotel-frontend-nuxt/app/layouts/customer.vue").default>
    hotelowner: ComponentProps<typeof import("C:/Projects/hotel-frontend-nuxt/app/layouts/hotelowner.vue").default>
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