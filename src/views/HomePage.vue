<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ pageName }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-fab horizontal="end" vertical="bottom">
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
      <ion-toast
        :is-open="!!savedFileMessage"
        :message="'File saved in ' + savedFileMessage"
        :duration="5000"
        @didDismiss="savedFileMessage = ''"
      ></ion-toast>
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
  IonToast,
} from "@ionic/vue";
import { document } from "ionicons/icons";
import { IIndication, IIndicationHeader, IMember } from "@/dtos";
import { computed, onMounted, Ref, ref, watch } from "vue";
import { exportToCsv, memberParse } from "@/utils";

const STORAGE_TABLE_KEY = "table";
const STORAGE_ID_KEY = "id";

const table: Ref<IMember[]> = ref([]);
const pageName: Ref<string> = ref("Main");
const membersCount: Ref<number> = ref(Number.NaN);
const indicationsHeaders: Ref<IIndicationHeader[]> = ref([]);
const idColumnName: Ref<string> = ref("");
const savedFileMessage: Ref<string> = ref("");

onMounted(() => {
  const data = JSON.parse(
    localStorage.getItem(STORAGE_TABLE_KEY) || JSON.stringify({})
  ) as IMember[];
  if (!(typeof data === typeof new Array<IMember>())) return;
  table.value = data;
  membersCount.value = table.value.length || Number.NaN;
  indicationsHeaders.value =
    (table.value[0]?.indications?.map(
      (v) => v.header
    ) as IIndicationHeader[]) || [];
  idColumnName.value = localStorage.getItem(STORAGE_ID_KEY) || "";
});

watch(membersCount, () => update(), { deep: true });

watch(indicationsHeaders, () => update(), {
  deep: true,
});

watch(table, () => update(), { deep: true });

watch(idColumnName, (value) => localStorage.setItem(STORAGE_ID_KEY, value));

const members = computed((): IMember[] => {
  const data = JSON.parse(
    localStorage.getItem(STORAGE_TABLE_KEY) || JSON.stringify({})
  ) as IMember[];
  return [...Array(Number.parseInt(membersCount.value.toString()) || 0)].map(
    (_: number, idx: number) =>
      ({
        id: idx,
        indications: createIndications(
          data[idx]?.indications.map((v) => v.value)
        ),
      } as IMember)
  );
});

const update = (): void => {
  localStorage.setItem(STORAGE_TABLE_KEY, JSON.stringify(table.value));
  table.value = members.value || [];
};

const createIndications = (values: number[] = []): IIndication[] => {
  return indicationsHeaders.value.map(
    (header: IIndicationHeader, idx: number) => ({
      header,
      value: values[idx] || Number.NaN,
    })
  );
};

const addHeader = (): void => {
  indicationsHeaders.value.push({
    name: "",
  } as IIndicationHeader);
};

const exportTable = async (): Promise<void> => {
  savedFileMessage.value = await exportToCsv(
    memberParse(table.value, idColumnName.value)
  );
};
</script>

<style scoped></style>
