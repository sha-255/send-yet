<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ pageName }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ pageName }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-button slot="fixed" @click="goHome">Go Back</ion-button>
      </ion-content>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonHeader, useIonRouter } from "@ionic/vue";
import { Ref, ref } from "vue";

const router = useIonRouter();
const pageName: Ref<string> = ref("404 Not Found");
const goHome = () => {
  router.push("/");
};
</script>

<style scoped lang="scss">
ion-button[slot="fixed"] {
  top: 50%;
  left: 50%;
  transform: translateY(-50%);
  transform: translateX(-50%);
}
</style>
