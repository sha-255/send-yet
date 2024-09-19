<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ pageName }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-fab horizontal="end" vertical="bottom" slot="fixed">
        <ion-fab-button @click="exportTable">
          <ion-icon :icon="document"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ pageName }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-input
          placeholder="Dwellers..."
          type="number"
          v-model="membersCount"
        ></ion-input>
        <ion-card>
          <ion-card-header>
            <ion-input placeholder="ID name..." v-model="idColumnName" />
            <ion-input
              placeholder="Indication name..."
              v-for="(header, idx) in indicationsHeaders"
              :key="idx"
              v-model="header.name"
            />
          </ion-card-header>
          <ion-card-content>
            <ion-button @click="addHeader">Add</ion-button>
            <ion-button @click="indicationsHeaders.pop()">Remove</ion-button>
          </ion-card-content>
        </ion-card>
        <ion-list v-if="table.length">
          <ion-card v-for="member in table" :key="member.id">
            <ion-card-header>
              <ion-card-title>#{{ member.id + 1 }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-list>
                <ion-item
                  v-for="(indication, idx) in member.indications"
                  :key="idx"
                >
                  <ion-label>{{ indication.header.name }}</ion-label>
                  <ion-input
                    type="number"
                    placeholder="Type here..."
                    v-model="indication.value"
                  >
                  </ion-input>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>
        </ion-list>
      </ion-content>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonList,
  IonItem,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonLabel,
  IonCardHeader,
  IonButton,
  IonIcon,
  IonFabButton,
  IonFab,
} from "@ionic/vue";
import { document } from "ionicons/icons";
import { IIndication, IIndicationHeader, IMember } from "@/dtos";
import { computed, Ref, ref, watch } from "vue";
import { exportToCsv, memberParse } from "@/utils";

const pageName: Ref<string> = ref("Start");
const membersCount: Ref<number> = ref(Number.NaN);
const indicationsHeaders: Ref<IIndicationHeader[]> = ref([]);
const table: Ref<IMember[]> = ref([]);
const idColumnName: Ref<string> = ref("");

watch(membersCount, () => (table.value = members.value || 0), { deep: true });

watch(indicationsHeaders, () => (table.value = members.value || 0), {
  deep: true,
});

const members = computed((): IMember[] => {
  return [...Array(Number.parseInt(membersCount.value.toString()) || 0)].map(
    (_: number, idx: number) =>
      ({
        id: idx,
        indications: createIndications(),
      } as IMember)
  );
});

const createIndications = (): IIndication[] => {
  return indicationsHeaders.value.map((header: IIndicationHeader) => ({
    header,
    value: Number.NaN,
  }));
};

const addHeader = (): void => {
  indicationsHeaders.value.push({
    name: "",
  } as IIndicationHeader);
};

const exportTable = (): void => {
  exportToCsv(memberParse(table.value, idColumnName.value));
};
</script>

<style scoped></style>
