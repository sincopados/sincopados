<template>
  <section class="relative bg-zinc-900 rounded-[3rem] p-10 md:p-20 overflow-hidden border border-zinc-800">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div class="z-10 text-center lg:text-left">
        <h2 class="text-5xl font-black mb-6 italic">Sigue el <span class="text-primary-500">Ritmo</span></h2>
        <p class="text-xl text-gray-400 mb-10 max-w-md mx-auto lg:mx-0">
          Mira cómo creamos magia audiovisual en tiempo real. Únete a nuestra comunidad.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <UButton 
            size="xl" 
            color="primary" 
            class="px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform"
            icon="i-simple-icons-tiktok"
          >
            Ver en TikTok
          </UButton>
          <UButton 
            size="xl" 
            variant="ghost" 
            color="success"
            class="px-10 rounded-full border border-zinc-700 hover:border-white transition-colors"
          >
            Instagram
          </UButton>
        </div>
      </div>

      <div class="flex justify-center">
        <div class="relative border-[12px] border-zinc-800 rounded-[3rem] w-[280px] h-[580px] bg-black shadow-2xl overflow-hidden shadow-primary-500/10 scale-90 lg:scale-100">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-6 bg-zinc-800 rounded-b-2xl z-20"></div>
          <video 
            autoplay 
            muted 
            loop 
            playsinline
            class="w-full h-full object-cover opacity-80"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-young-woman-dancing-and-recording-a-video-for-social-media-42562-large.mp4" type="video/mp4">
          </video>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  </section>
</template>