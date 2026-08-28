<script setup lang="ts">
// Visible para todos los roles: cada usuario tiene código y comisiones.
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">Sistema de referidos</h1>
      <p class="mt-1 text-muted">Comparte tu código y gana por cada servicio o curso contratado.</p>
    </div>

    <DashboardWithdrawalPanel />

    <DashboardReferralPanel />
  </div>
</template>
