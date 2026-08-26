<template>
  <section class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
    <div class="space-y-8">
      <h2 class="text-6xl font-bold tracking-tight">Nuestra <span class="text-primary">Esencia</span></h2>
      <div class="space-y-6 text-gray-400 text-lg leading-relaxed">
        <p>
          Sincopados Producciones es una plataforma creativa y estratégica enfocada en el crecimiento de artistas, marcas y negocios a través de contenido audiovisual.
        </p>
        <p>
          No solo creamos videos. <br/> Creamos presencia, posicionamiento y oportunidades.
        </p>
        <p>
          Nacemos desde la cultura urbana, entendiendo la calle, el arte y el proceso real de construir desde cero. Hoy conectamos ese conocimiento con estrategias digitales modernas para ayudar a nuestros clientes a destacar en redes sociales.
        </p>
      </div>
    </div>
    <div class="relative flex justify-center lg:justify-end">
      <NuxtPicture
        src="https://picsum.photos/400/500?grayscale"
        alt=""
        class="block w-2/3 rotate-[-3deg] overflow-hidden rounded-3xl border border-zinc-800 shadow-2xl transition-transform duration-500 hover:rotate-0"
        :img-attrs="{ class: 'h-auto w-full' }"
        sizes="lg:60vw 2xl:30vw"
        loading="lazy"
        decoding="async"
      />
      <NuxtPicture
        src="https://picsum.photos/350/450"
        alt=""
        class="absolute -bottom-10 -left-4 block w-1/2 rotate-[5deg] overflow-hidden rounded-3xl border-4 border-primary shadow-2xl transition-transform duration-500 hover:rotate-0 lg:-left-10"
        :img-attrs="{ class: 'h-auto w-full' }"
        sizes="lg:45vw 2xl:22vw"
        loading="lazy"
        decoding="async"
      />
    </div>
  </section>
</template>