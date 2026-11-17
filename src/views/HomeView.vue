<script setup lang="ts">
import { onMounted } from 'vue'
import { summonerService } from '@/services/summonerService'

onMounted(async () => {
  console.log(await summonerService.getProfile('euw', { gameName: 'Kaori', tagLine: 'EUW' }))
  await summonerService.getProfile('euw', { gameName: 'Inconnu', tagLine: 'EUW' }).catch(console.error)
})
</script>

<template>
    <h1>Aerytics</h1>
</template>