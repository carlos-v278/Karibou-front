<script setup lang="ts">
import { buildingService, messagingService } from 'src/_services';
import { onMounted, ref } from 'vue';
import { BuildingDetailsApartment } from 'src/utils/interfaces';
import ListItem from 'src/features/_base-components/ListItem.vue';
import ListItems from 'src/features/_base-components/listItems.vue';
import MyAvatar from 'src/features/_base-components/MyAvatar.vue';
import { useStoreBaseFeatures } from 'stores/base-features';
import { notify } from 'src/utils/utils';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/features/_utils/user.store';
import { storeToRefs } from 'pinia';

const userData = useUserStore();
//all user data ex: profile and current role
const { getUserProfile } = storeToRefs(userData);

onMounted(async () => {
  await loadApartmentsDetails();
});
const props = defineProps({
  apartment: Number,
});
const router = useRouter();

const emits = defineEmits(['closeApartDetails']);
const apartmentsDetails = ref<BuildingDetailsApartment>();
async function loadApartmentsDetails() {
  useStoreBaseFeatures().enableLoading();
  await buildingService
    .getApartmentDetails(props.apartment)
    .then(<Response>(response: Response) => {
      apartmentsDetails.value = response.data;
      useStoreBaseFeatures().disableLoading();
    })
    .catch(() => {
      useStoreBaseFeatures().disableLoading();
    });
}
function sendMessage(userId: number): void {
  let bodyRequest = {
    participants: [userId],
  };
  useStoreBaseFeatures().enableLoading();
  messagingService
    .newConversation(bodyRequest)
    .then(() => {
      notify("Une conversation vient d'être créée.", 'positive');
      useStoreBaseFeatures().disableLoading();
      router.push({ name: 'all_conversations' });
    })
    .catch(() => {
      useStoreBaseFeatures().disableLoading();
    });
}
</script>

<template>
  <div class="apartment-details">
    <div class="header">
      <q-icon
        size="md"
        color="primary"
        class="btn-back"
        label="back"
        name="fa-solid fa-arrow-left cursor-pointer"
        @click="emits('closeApartDetails')"
      >
      </q-icon>
    </div>
    <div class="main">
      <div class="list-items-container">
        <ListItem v-if="apartmentsDetails?.owner">
          <template #icons>
            <div class="icon row items-center justify-center">
              <my-avatar
                :picture="apartmentsDetails?.owner.picture"
              ></my-avatar>
            </div>
          </template>
          <template #infos>
            <span style="font-size: 13px; font-weight: 600" class="item-title">
              {{ apartmentsDetails?.owner.firstname }}
              {{ apartmentsDetails?.owner.lastname }}
            </span>
            <span
              style="font-size: 13px; font-weight: 300"
              class="items-baseline"
            >
              {{ $t('owner') }}
            </span>
          </template>
          <template v-slot:actions>
            <q-btn
              v-if="getUserProfile?.id !== apartmentsDetails?.owner.id"
              round
              unelevated
              color="white"
              size="sm"
              text-color="primary"
              icon="fa-solid fa-message"
              @click="sendMessage(apartmentsDetails?.owner.id)"
            />
          </template>
        </ListItem>
        <ListItems
          v-if="apartmentsDetails?.tenants"
          :list-items="apartmentsDetails?.tenants"
        >
          <template #item="{ id, firstname, lastname, picture }">
            <ListItem>
              <template #icons>
                <div class="icon row items-center justify-center">
                  <my-avatar :picture="picture"></my-avatar>
                </div>
              </template>
              <template #infos>
                <span
                  style="font-size: 13px; font-weight: 600"
                  class="item-title"
                >
                  {{ firstname }} {{ lastname }}
                </span>
                <span
                  style="font-size: 13px; font-weight: 300"
                  class="items-baseline"
                >
                  {{ $t('tenant') }}
                </span>
              </template>
              <template v-slot:actions>
                <q-btn
                  round
                  unelevated
                  color="white"
                  size="md"
                  text-color="primary"
                  icon="fa-solid fa-message"
                  @click="sendMessage(id)"
                />
              </template>
            </ListItem>
          </template>
        </ListItems>
      </div>
    </div>
    <div class="footer"></div>
  </div>
</template>

<style scoped lang="scss">
.apartment-details {
  .header {
    padding: 0 10px;
  }
  .main {
    .list-items-container {
      margin: 30px auto;
      max-width: 80%;
    }
  }
}
</style>
