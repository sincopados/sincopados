<template>
    <div class="flex flex-col h-screen">
        <!--  header  -->
        <SharedHeader />

        <!--  main section  -->
        <main class="container mx-auto flex-1 mt-2">
            <slot />
        </main>
        
        <!--  footer  -->
        <SharedFooter />
    </div>
</template>