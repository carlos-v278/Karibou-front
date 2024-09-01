<script lang="ts" setup>
import { BuildingDetails } from 'src/utils/interfaces';

import { buildingService, messagingService } from 'src/_services';
import { onMounted, ref } from 'vue';
import PropertyDetails from 'src/features/_base-components/PropertyDetails.vue';
import BuildingApartIllustration from 'src/features/_base-components/BuildingApartIllustration.vue';
import PublicApartmentDetails from 'src/features/dwelling/components/PublicApartmentDetails.vue';
import ListItem from 'src/features/_base-components/ListItem.vue';
import MyAvatar from 'src/features/_base-components/MyAvatar.vue';
import ListItems from 'src/features/_base-components/listItems.vue';
import { useStoreBaseFeatures } from 'stores/base-features';
import { useRouter } from 'vue-router';
import { notify } from 'src/utils/utils';
import { ComponentToDisplay } from 'src/features/dwelling/componentToDisplay';
import { useUserStore } from 'src/features/_utils/user.store';
import { storeToRefs } from 'pinia';

const userData = useUserStore();
//all user data ex: profile and current role
const { getUserProfile } = storeToRefs(userData);

const router = useRouter();
const props = defineProps({
  buildingId: {
    type: Number,
  },
  buildingLabel: String,
});
const emits = defineEmits(['goBack']);

onMounted(async () => {
  await loadBuildingDetails();
});

// all the details data about the selected building
const buildingDetailsData = ref<BuildingDetails>({
  id: undefined,
  city: undefined,
  country: undefined,
  number: undefined,
  street: undefined,
  zipcode: undefined,
  advertisements: undefined,
  apartments: undefined,
  syndicate: undefined,
  allMembers: undefined,
});
async function loadBuildingDetails() {
  useStoreBaseFeatures().enableLoading();
  await buildingService
    .getBuildingDetails(props.buildingId)
    .then(<Response>(response: Response) => {
      buildingDetailsData.value = response.data;
      useStoreBaseFeatures().disableLoading();
    })
    .catch(() => {
      useStoreBaseFeatures().disableLoading();
    });
}

const currentFlatSelected = ref<number | undefined>(undefined);
const componentToDisplay = ref(ComponentToDisplay.buildingDetails);
function getSelectedFlatEmit(currentFlat: number): void {
  currentFlatSelected.value = currentFlat;
  componentToDisplay.value = ComponentToDisplay.apartmentMembers;
}

function showComponent(component: ComponentToDisplay): void {
  componentToDisplay.value = component;
}

// function which help to open a conversation with the user selected
function sendMessage(userId: number): void {
  const bodyRequest = {
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
  <div class="building-details">
    <div class="details-header">
      <q-btn
        size="md"
        color="grey-light"
        text-color="primary"
        class="btn-back"
        round
        icon="fa-solid fa-arrow-left"
        @click="emits('closeForm')"
      />
    </div>
    <div class="details-main">
      <PropertyDetails
        icon="fa-building"
        :title="componentToDisplay"
        type="collectiveResidence"
        :component-title="props.buildingLabel"
      >
      </PropertyDetails>
      <q-icon
        v-if="componentToDisplay === ComponentToDisplay.buildingMembers"
        size="md"
        color="primary"
        class="btn-back"
        label="back"
        name="fa-solid fa-arrow-left cursor-pointer"
        @click="showComponent(ComponentToDisplay.buildingDetails)"
      />
      <div
        v-if="componentToDisplay === ComponentToDisplay.buildingDetails"
        class="building_actions"
      >
        <ListItem>
          <template #icons>
            <div class="icon row items-center justify-center">
              <q-icon
                name="fa-solid fa-users"
                round
                size="sm"
                color="primary"
              />
            </div>
          </template>
          <template #infos>
            <span style="font-size: 13px; font-weight: 600" class="item-title">
              {{ $t('discoverNeighbour') }}
            </span>
          </template>
          <template v-slot:actions>
            <q-btn
              round
              unelevated
              color="white"
              size="md"
              text-color="primary"
              icon="fa-solid fa-angle-right"
              @click="showComponent(ComponentToDisplay.buildingMembers)"
            />
          </template>
        </ListItem>
 <!--        <ListItem>
          <template #icons>
            <div class="icon row items-center justify-center">
              <q-icon
                name="fa-solid fa-bullhorn"
                round
                size="sm"
                color="primary"
              />
            </div>
          </template>
          <template #infos>
            <span style="font-size: 13px; font-weight: 600" class="item-title">
              {{ $t('discoverAdvertising') }}
            </span>
          </template>
          <template v-slot:actions>
            <q-btn
              round
              unelevated
              color="white"
              size="md"
              text-color="primary"
              icon="fa-solid fa-angle-right"
              :to="`/annonces-immeuble/${props.buildingId}/`"
            />
          </template>
        </ListItem> -->
      </div>
      <div
        v-if="componentToDisplay === ComponentToDisplay.buildingDetails"
        class="apartements_separation"
      >
        {{ $t('buildingApartment') }}
      </div>
      <building-apart-illustration
        v-if="componentToDisplay === ComponentToDisplay.buildingDetails"
        :apartments="buildingDetailsData.apartments"
        @selcted-curr-flat="getSelectedFlatEmit"
      >
      </building-apart-illustration>
      <public-apartment-details
        v-if="componentToDisplay === ComponentToDisplay.apartmentMembers"
        :apartment="currentFlatSelected"
        @close-apart-details="showComponent(ComponentToDisplay.buildingDetails)"
      >
      </public-apartment-details>
      <div class="building-members">
        <ListItems
          v-if="componentToDisplay === ComponentToDisplay.buildingMembers"
          :list-items="buildingDetailsData?.allMembers"
        >
          <template #item="{ id, firstname, lastname, picture, roles }">
            <ListItem >
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
                  v-if="roles.includes('ROLE_OWNER_CREATE')"
                  style="font-size: 13px; font-weight: 300"
                  class="items-baseline"
                >
                  {{ $t('buildingManagerPerson') }}
                </span>
                <span
                  v-if="roles.includes('ROLE_TENANT_CREATE')"
                  style="font-size: 13px; font-weight: 300"
                  class="items-baseline"
                >
                  {{ $t('owner') }}
                </span>
                <span
                  v-if="roles.includes('ROLE_TENANT_EDIT')"
                  style="font-size: 13px; font-weight: 300"
                  class="items-baseline"
                >
                  {{ $t('tenant') }}
                </span>
              </template>
              <template v-slot:actions>
                <q-btn
                  v-if="getUserProfile?.id !== id"
                  round
                  unelevated
                  color="white"
                  size="sm"
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
  </div>
</template>

<style lang="scss" scoped>
.building-details {
  width: 100%;

  padding: 39px;

  .details-main {
    .building_actions {
      max-width: 80%;
      margin: 0 auto;
    }
  }
}

.apartements_separation {
  border-bottom: 1px solid black;
  font-weight: 500;
  margin: 60px 0 50px;
  font-size: var(--fs-400);
}
.building-members {
  max-width: 578px;
  margin: 0 auto;
}
@media screen and (min-width: 977px) {
  .building-details {
    display: block;
    width: 100%;
  }
}
</style>
