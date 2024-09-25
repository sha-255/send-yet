<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <transition mode="out-in" name="fade-in">
          <ion-title :key="pageName">{{ pageName }}</ion-title>
        </transition>
      </ion-toolbar>
    </ion-header>

    <ion-fab horizontal="end" vertical="bottom" v-if="membersCount">
      <ion-fab-button @click="exportTable">
        <ion-icon :icon="document"></ion-icon>
      </ion-fab-button>
    </ion-fab>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <transition mode="out-in" name="fade-in">
            <ion-title size="large" :key="pageName">{{ pageName }}</ion-title>
          </transition>
        </ion-toolbar>
      </ion-header>

      <transition mode="out-in" name="fade-in" v-if="!membersCount">
        <div class="p-4 w-full" v-if="!membersCount">
          <img src="../../public/icon.png" class="wiggle" />
        </div>
      </transition>

      <div :class="{ bottom: !membersCount }">
        <div class="mx-4">
          <ion-input
            mode="md"
            placeholder="Dwellers..."
            type="number"
            v-model="membersCount"
          ></ion-input>
        </div>
      </div>

      <transition name="fade">
        <div v-if="membersCount">
          <ion-card>
            <ion-card-header>
              <ion-input placeholder="ID name..." v-model="idColumnName" />
              <transition-group name="nested">
                <ion-input
                  placeholder="Indication name..."
                  v-for="(header, idx) in indicationsHeaders"
                  :key="idx"
                  v-model="header.name"
                />
              </transition-group>
            </ion-card-header>
            <ion-card-content>
              <ion-button @click="addHeader">Add</ion-button>
              <ion-button @click="indicationsHeaders.pop()">Remove</ion-button>
            </ion-card-content>
          </ion-card>
          <ion-list v-if="table.length">
            <transition-group name="nested">
              <ion-card v-for="member in table" :key="member.id">
                <ion-card-header>
                  <transition mode="out-in" name="fade-in">
                    <ion-card-title :key="idColumnName" class="inner">{{
                      `${idColumnName} ${member.id + 1}`
                    }}</ion-card-title>
                  </transition>
                </ion-card-header>
                <ion-card-content>
                  <ion-list class="rounded-xl">
                    <transition-group name="nested">
                      <ion-item
                        v-for="(indication, idx) in member.indications"
                        :key="idx"
                      >
                        <ion-input
                          class="inner"
                          type="number"
                          placeholder="Type the readings here..."
                          :label="
                            indication.header.name
                              ? indication.header.name + ':'
                              : ''
                          "
                          v-model="indication.value"
                        ></ion-input>
                      </ion-item>
                    </transition-group>
                  </ion-list>
                </ion-card-content>
              </ion-card>
            </transition-group>
          </ion-list>
        </div>
      </transition>
    </ion-content>
    <ion-toast
      :is-open="!!savedFileMessage"
      :message="savedFileMessage"
      :duration="5000"
      @didDismiss="savedFileMessage = ''"
    ></ion-toast>
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
  IonCardHeader,
  IonButton,
  IonIcon,
  IonFabButton,
  IonFab,
  IonToast,
} from "@ionic/vue";
import { document } from "ionicons/icons";
import { computed, onMounted, Ref, ref, watch } from "vue";
import { IIndication, IIndicationHeader, IMember } from "@/dtos";
import { exportToCsv, memberParse } from "@/utils";

const STORAGE_TABLE_KEY = "table";
const STORAGE_ID_KEY = "id";
const APP_NAME = "Send Yet";
const PAGE_NAME = "Indications";

const table: Ref<IMember[]> = ref([]);
const pageName: Ref<string> = ref(APP_NAME);
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

watch(
  membersCount,
  () => {
    if (!membersCount.value) {
      pageName.value = APP_NAME;
    } else {
      pageName.value = PAGE_NAME;
    }
    update();
  },
  { deep: true }
);

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

<style scoped lang="scss">
.bottom {
  position: absolute;
  bottom: 20px;
  width: 100%;
}

.transition {
  transition: all 5s ease;
}
</style>
