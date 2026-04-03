<template>
  <div class="fixed bottom-6 right-6 z-50">
    <UButton
      :to="whatsappUrl"
      target="_blank"
      size="xl"
      color="primary"
      variant="solid"
      rounded="full"
      icon="i-simple-icons-whatsapp"
      class="shadow-xl hover:scale-115 transition-transform duration-200 h-14 w-14 flex items-center justify-center rounded-full"
      aria-label="Contactar por WhatsApp"
    />
  </div>
</template>

<script setup>
// Obtenemos la URL actual de forma reactiva
const url = useRequestURL()

// Configuración del mensaje y número
const phone = '573105720977' 
const baseMessage = 'Hola, necesito más información. Estoy viendo esta página:'

const whatsappUrl = computed(() => {
  // Construimos el mensaje incluyendo la URL actual (href incluye protocolo y dominio)
  const fullMessage = `${baseMessage} ${url.href}`
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`
})
</script>

<style scoped>
/* Opcional: Un pequeño efecto de pulso para llamar la atención */
.fixed {
  animation: pulse-subtle 2s infinite;
}

@keyframes pulse-subtle {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>