<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { StatusBar } from "@capacitor/status-bar";
import { onMounted } from "vue";

onMounted(() => {
  StatusBar.setBackgroundColor({ color: "#1F1F1F" });
});
</script>
