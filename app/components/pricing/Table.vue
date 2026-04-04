<script setup lang="ts">
import type { link } from '#build/ui';
import { string } from 'zod';

const { t } = useI18n();

// Obtenemos la URL actual de forma reactiva
const url = useRequestURL()

// Configuración del mensaje y número
const phone = '573105720977';

const getWhatsAppLink = (planName: string) => {
  const message = `Hola, Deseo Adquirir El Paquete ${planName} ${url.href}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

const planStandarMessage = computed(() => getWhatsAppLink('Standar'));
const planProfessionalMessage = computed(() => getWhatsAppLink('Professional'));
const planStarterMessage = computed(() => getWhatsAppLink('Started'));

const planPlusMessage = computed(() => getWhatsAppLink('Plus'));

const planProMessage = computed(() => getWhatsAppLink('Pro'));

const planStudioMessage = computed(() => getWhatsAppLink('Studio'));

const tiers = [
  {
    id: 'standard',
    title: t('pricingTableTitle1'),
    price: t('pricingValueStandar'),
    description: t('pricingTableDescription1'),
    billingCycle: t('pricingTableBillingCycle1'),
    button: { label: 'Comprar ahora',  variant: 'subtle' as const},
    
  },
  {
    id: 'profesional',
    title: t('pricingTableTitle2'),
    price: t('pricingValueProfessional'),
    description: t('pricingTableDescription2'),
    billingCycle: t('pricingTableBillingCycle1'),
    button: { label: 'Comprar ahora'},
    highlight: true,
  },
  {
    id: 'enterprise',
    title: t('pricingTableTitle3'),
    price: 'Personalizado',
    description: t('pricingTableDescription3'),
    button: { label: 'Contactar ventas', color: 'neutral' as const},
  },
];
const sections = [
  {
    id: 'features',
    title: t('pricingTableFeaturesTitle'),
    features: [
      {
        id: 'hours',
        title: t('pricingTableFeatureTitle1'),
        tiers: { standard: '4', profesional: '8', enterprise: '+8' },
      },
      {
        id: 'posts',
        title: t('pricingTableFeatureTitle2'),
        tiers: { standard: '3', profesional: '6 ', enterprise: '+7' },
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
      {
        id: 'caroucel',
        title: t('pricingTableFeatureTitle5'),
        tiers: { standard: false, profesional: true, enterprise: true },
      },
      {
        id: 'ai',
        title: t('pricingTableFeatureTitle6'),
        tiers: { standard: false, profesional: true, enterprise: true },
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
        title: t('pricingTableMarketingTitle4'),
        tiers: { standard: true, profesional: true, enterprise: true },
      },
      {
        title: t('pricingTableMarketingTitle5'),
        tiers: { standard: true, profesional: true, enterprise: true },
      },
      {
        title: t('pricingTableMarketingTitle6'),
        tiers: { standard: true, profesional: true, enterprise: true },
      },
      {
        title: t('pricingTableMarketingTitle7'),
        tiers: { standard: true, profesional: true, enterprise: true },
      },
      {
        title: t('pricingTableMarketingTitle8'),
        tiers: { standard: true, profesional: true, enterprise: true },
      },
            {
        title: t('pricingTableMarketingTitle9'),
        tiers: { standard: false, profesional: true, enterprise: true },
      },
      {
        title: t('pricingTableMarketingTitle10'),
        tiers: { standard: false, profesional: true, enterprise: true },
      },
            {
        title: t('pricingTableMarketingTitle11'),
        tiers: { standard: false, profesional: true, enterprise: true },
      },
    ],
  },
];
const plans = ref([
  {
    title: t('pricingPlanPacksTitle1'),
    description: t('pricingPlanPacksDescription1'),
    price: t('pricingValueStarter'),
    features: [
      t('pricingPlanPacksFeature4Videos'),
      t('pricingPlanPacksFeature1'),
      t('pricingPlanPacksFeature2'),
      t('pricingPlanPacksFeature3'),
      t('pricingPlanPacksFeature4')
    ],
    button: {
      label: 'Comprar ahora',
      to: planStarterMessage,
    },
  },
  {
    title: t('pricingPlanPacksTitle2'),
    description: t('pricingPlanPacksDescription2'),
    price: t('pricingValuePlus'),
    features: [
      t('pricingPlanPacksFeature8Videos'),
      t('pricingPlanPacksFeature1'),
      t('pricingPlanPacksFeature2'),
      t('pricingPlanPacksFeature3'),
      t('pricingPlanPacksFeature4')
    ],
    button: {
      label: 'Comprar ahora',
      to: planPlusMessage,
    },
  },
  {
    title: t('pricingPlanPacksTitle3'),
    description: t('pricingPlanPacksDescription4'),
    price: t('pricingValuePro'),
    features: [
      t('pricingPlanPacksFeature12Videos'),
      t('pricingPlanPacksFeature1'),
      t('pricingPlanPacksFeature2'),
      t('pricingPlanPacksFeature3'),
      t('pricingPlanPacksFeature4')
    ],
    button: {
      label: 'Comprar ahora',
      to: planProMessage,
    },
  },
  {
    title: t('pricingPlanPacksTitle4'),
    description: t('pricingPlanPacksDescription4'),
    price: t('pricingValueStudio'),
    features: [
      t('pricingPlanPacksFeature16Videos'),
      t('pricingPlanPacksFeature1'),
      t('pricingPlanPacksFeature2'),
      t('pricingPlanPacksFeature3'),
      t('pricingPlanPacksFeature4')
    ],
    button: {
      label: 'Comprar ahora',
      to: planStudioMessage,
    },
  },
]);
</script>

<template>
  <UPricingTable :tiers="tiers" :sections="sections" 
    :ui="{ 
        tierTitle: 'text-2xl',
        sectionTitle: 'text-2xl',
        tierBadge: 'text-2xl',
        featureTitle: 'text-xl'
      }"
  >
    <!-- Personalizar el título de un nivel específico -->
    <template #profesional-title="{ tier }">
      <div class="flex items-center text-2xl gap-2">
        <UIcon name="i-lucide-crown" class="size-4 text-amber-500" />
        {{ tier.title }}
      </div>
    </template>

    <!-- Personalizar el título de una sección específica -->
    <template #section-marketing-title="{ section }">
      <div class="flex items-center text-2xl gap-2">
        <UIcon name="gis:earth-network" class="size-8 text-green-500" />
        <span class="font-semibold text-green-700">{{ section.title }}</span>
      </div>
    </template>
    <!-- Personalizar el valor de una característica específica -->
    <template #feature-hours-value="{ feature, tier }">
      <template v-if="feature.tiers?.[tier.id]">
        <UBadge
          :label="String(feature.tiers[tier.id])"
          color="primary"
          variant="soft"
          class="text-xl px-4"          
        />
      </template>
      <UIcon v-else name="i-lucide-x" class="size-4 text-muted" />
    </template>

    <template #feature-posts-value="{ feature, tier }">
      <template v-if="feature.tiers?.[tier.id]">
        <UBadge
          :label="String(feature.tiers[tier.id])"
          color="primary"
          variant="soft"
          :ui="{ 
            label: 'text-xl px-2',
          }"
        />
      </template>
      <UIcon v-else name="i-lucide-x" class="size-4 text-muted" />
    </template>
  </UPricingTable>

  <UPageSection
    :headline="$t('pricingTablePackHeadline')"
    :title="$t('pricingTablePackTitle')"
    :description="$t('pricingTablePacDescription')"
  />

  <UPricingPlans orientation="vertical" :plans="plans" />
</template>
 