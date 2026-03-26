import type { FlatConfigComposer } from "../node_modules/.pnpm/eslint-flat-config-utils@3.0.2/node_modules/eslint-flat-config-utils/dist/index.mjs"
import { defineFlatConfigs } from "../node_modules/.pnpm/@nuxt+eslint-config@1.15.2_@typescript-eslint+utils@8.57.1_eslint@10.1.0_jiti@2.6.1__ty_9362272e9b8d3d5c3f0431bc2edd2ffd/node_modules/@nuxt/eslint-config/dist/flat.mjs"
import type { NuxtESLintConfigOptionsResolved } from "../node_modules/.pnpm/@nuxt+eslint-config@1.15.2_@typescript-eslint+utils@8.57.1_eslint@10.1.0_jiti@2.6.1__ty_9362272e9b8d3d5c3f0431bc2edd2ffd/node_modules/@nuxt/eslint-config/dist/flat.mjs"

declare const configs: FlatConfigComposer
declare const options: NuxtESLintConfigOptionsResolved
declare const withNuxt: typeof defineFlatConfigs
export default withNuxt
export { withNuxt, defineFlatConfigs, configs, options }