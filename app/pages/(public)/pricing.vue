<template>
    <UPageCTA
    orientation="horizontal"
    :title="$t('pricingPageCTATitle')"
    :description="$t('pricingPageCTADescription')"
  >
    <template #default>
      <div class="flex items-center justify-center">
        <IconsLogoHorizontal :size="409" />
      </div>
    </template>
  </UPageCTA>

  <div class="mt-10" >
    <PricingTable />
  </div>


</template>