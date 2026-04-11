<template>
    <section id="contacto" class="bg-default py-24 lg:py-32">
      <UContainer>
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-12">
            <UBadge label="Contacto" color="primary" variant="subtle" class="mb-4" />
            
            <h2 class="text-3xl md:text-4xl font-bold text-highlighted mb-4 text-balance">
              Comienza tu proyecto hoy
            </h2>
            
            <p class="text-lg text-muted">
              Cuéntanos sobre tu proyecto y te responderemos en menos de 24 horas.
            </p>
          </div>
          
          <UCard :ui="{ body: 'p-8' }">
            <form class="space-y-6" @submit.prevent>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="Nombre" name="name" required>
                  <UInput placeholder="Tu nombre" icon="i-lucide-user" />
                </UFormField>
                
                <UFormField label="Email" name="email" required>
                  <UInput type="email" placeholder="tu@email.com" icon="i-lucide-mail" />
                </UFormField>
              </div>
              
              <UFormField label="Tipo de servicio" name="service">
                <USelect 
                  placeholder="Selecciona un servicio"
                  :items="[
                    'Videos Educativos',
                    'Videos LifeStyle',
                    'Videos Podcast',
                    'Videos Corporativos',
                    'Transmisiones en Vivo',
                    'Otro'
                  ]"
                />
              </UFormField>
              
              <UFormField label="Mensaje" name="message" required>
                <UTextarea 
                  placeholder="Cuéntanos sobre tu proyecto..."
                  :rows="4"
                />
              </UFormField>
              
              <UButton 
                type="submit" 
                label="Enviar mensaje" 
                icon="i-lucide-send"
                block
                size="lg"
              />
            </form>
          </UCard>
        </div>
      </UContainer>
    </section>
</template>