<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { onMounted } from "vue";
import { StatusBar } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";

onMounted(() => {
  if (!Capacitor.isNativePlatform()) return;
  StatusBar.setBackgroundColor({ color: "#000" });
});
</script>
