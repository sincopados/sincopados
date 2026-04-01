<script setup lang="ts">
const { t } = useI18n();

const tiers = [
  {
    id: 'standard',
    title: t('pricingTableTitle1'),
    price: '$1.499.000',
    description: t('pricingTableDescription1'),
    billingCycle: t('pricingTableBillingCycle1'),
    button: { label: 'Comprar ahora', variant: 'subtle' as const },
  },
  {
    id: 'profesional',
    title: t('pricingTableTitle2'),
    price: '$2.099.000',
    description: t('pricingTableDescription2'),
    billingCycle: t('pricingTableBillingCycle1'),
    button: { label: 'Comprar ahora' },
    highlight: true,
  },
  {
    id: 'enterprise',
    title: t('pricingTableTitle3'),
    price: 'Personalizado',
    description: t('pricingTableDescription3'),
    button: { label: 'Contactar ventas', color: 'neutral' as const },
  },
];
const sections = [
  {
    id: 'features',
    title: t('pricingTableFeaturesTitle'),
    features: [
      {
        id: 'horas',
        title: t('pricingTableFeatureTitle1'),
        tiers: { standard: '4', profesional: '8', enterprise: '+8' },
      },
      {
        id: 'posts',
        title: t('pricingTableFeatureTitle2'),
        tiers: { standard: '3', profesional: '5', enterprise: '+7' },
      },
      {
        id: 'plane',
        title: t('pricingTableFeatureTitle3'),
        tiers: { standard: true, profesional: true, enterprise: true },
      },
      {
        id: 'edition',
        title: t('pricingTableFeatureTitle4'),
        tiers: { standard: true, profesional: true, enterprise: true },
      },
    ],
  },
  {
    id: 'marketing',
    title: t('pricingTableMarketingTitile'),
    features: [
      {
        title: t('pricingTableMarketingTitle1'),
        tiers: { standard: true, profesional: true, enterprise: true },
      },
      {
        title: t('pricingTableMarketingTitle2'),
        tiers: { standard: true, profesional: true, enterprise: true },
      },
      {
        title: t('pricingTableMarketingTitle3'),
        tiers: { standard: true, profesional: true, enterprise: true },
      },
      {
        title: t('pricingTableMarketingTitle1'),
        tiers: { standard: true, profesional: true, enterprise: true },
      },
    ],
  },
];
const plans = ref([
  {
    title: 'Individual',
    description: 'Pensado para desarrolladores independientes.',
    price: '$249',
    features: ['Un desarrollador', 'Acceso de por vida'],
    button: {
      label: 'Comprar ahora',
    },
  },
  {
    title: 'Equipo',
    description: 'Ideal para pequeños equipos.',
    price: '$499',
    features: ['Hasta 5 desarrolladores', 'Todo en Individual'],
    button: {
      label: 'Comprar ahora',
    },
  },
  {
    title: 'Organización',
    description: 'Perfecto para equipos y organizaciones más grandes.',
    price: '$999',
    features: ['Hasta 20 desarrolladores', 'Todo en Equipo'],
    button: {
      label: 'Comprar ahora',
    },
  },
]);
</script>

<template>
  <UPricingTable :tiers="tiers" :sections="sections">
    <!-- Personalizar el título de un nivel específico -->
    <template #profesional-title="{ tier }">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-crown" class="size-4 text-amber-500" />
        {{ tier.title }}
      </div>
    </template>

    <!-- Personalizar el título de una sección específica -->
    <template #section-security-title="{ section }">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-shield-check" class="size-4 text-green-500" />
        <span class="font-semibold text-green-700">{{ section.title }}</span>
      </div>
    </template>

    <!-- Personalizar el valor de una característica específica -->
    <template #feature-developers-value="{ feature, tier }">
      <template v-if="feature.tiers?.[tier.id]">
        <UBadge
          :label="String(feature.tiers[tier.id])"
          color="primary"
          variant="soft"
        />
      </template>
      <UIcon v-else name="i-lucide-x" class="size-4 text-muted" />
    </template>
  </UPricingTable>

  <UPageSection
    headline="Precios"
    title="Precios"
    description="Descubre nuestros precios y planes."
  />

  <UPricingPlans orientation="vertical" :plans="plans" />
</template>
 