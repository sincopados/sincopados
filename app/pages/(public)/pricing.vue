<template>
    <UPageCTA
    orientation="horizontal"
    :title="$t('pricingPageCTATitle')"
    :description="$t('pricingPageCTADescription')"
  >
    <template #default>
      <div class="flex items-center justify-center">
        <IconsLogo name="i-simple-icons-nuxtdotjs" :size="150" />
      </div>
    </template>
  </UPageCTA>

  <div class="mt-10" />

  <PricingTable />
</template>