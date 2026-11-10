<script setup lang="ts">
/** Ancla a la que apuntan los CTAs del hero. */
const props = withDefaults(defineProps<{ formAnchor?: string }>(), { formAnchor: 'postulacion' })

const pillars = MEDIA_NETWORK_INTERESTS.map(key => ({
  key,
  label: MEDIA_NETWORK_INTEREST_LABELS[key],
  icon: MEDIA_NETWORK_INTEREST_ICONS[key],
}))
</script>

<template>
  <section class="relative isolate overflow-hidden py-20 sm:py-28">
    <!-- Halo dorado de marca detrás del titular -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl"
    >
      <div class="aspect-[3/2] w-[48rem] rounded-full bg-primary/20 dark:bg-primary/15" />
    </div>

    <UContainer class="flex flex-col items-center text-center">
      <UBadge
        label="Convocatoria abierta · Medellín"
        icon="i-lucide-radio-tower"
        color="primary"
        variant="subtle"
        size="lg"
        class="mb-6"
      />

      <h1 class="max-w-4xl font-condensed text-5xl font-bold uppercase tracking-tight text-highlighted text-balance sm:text-6xl lg:text-7xl">
        Sincopados
        <span class="text-primary">Media Network</span>
      </h1>

      <p class="mt-6 max-w-2xl text-xl font-medium text-toned text-balance sm:text-2xl">
        No buscamos clientes tradicionales, <span class="text-highlighted">seleccionamos aliados.</span>
      </p>

      <p class="mt-4 max-w-2xl text-lg text-muted text-pretty">
        Somos un centro de medios y agencia multimedia en Medellín. Del contenido a la monetización
        remota: cualquier servicio, alianza o colaboración empieza con una consulta estratégica previa.
      </p>

      <div class="mt-10 flex flex-wrap justify-center gap-3">
        <UButton
          :to="`#${props.formAnchor}`"
          label="Postúlate ahora"
          trailing-icon="i-lucide-arrow-down"
          size="xl"
        />
        <UButton
          :to="SINCOPADOS_YOUTUBE_CHANNEL"
          target="_blank"
          rel="noopener"
          label="Ver el canal"
          icon="i-simple-icons-youtube"
          color="neutral"
          variant="subtle"
          size="xl"
        />
      </div>

      <ul class="mt-14 grid w-full max-w-4xl grid-cols-2 gap-3 lg:grid-cols-4">
        <li
          v-for="pillar in pillars"
          :key="pillar.key"
          class="flex flex-col items-center gap-2 rounded-xl border border-default bg-elevated/50 px-4 py-5"
        >
          <UIcon :name="pillar.icon" class="size-6 text-primary" />
          <span class="text-sm font-medium text-highlighted">{{ pillar.label }}</span>
        </li>
      </ul>
    </UContainer>
  </section>
</template>
