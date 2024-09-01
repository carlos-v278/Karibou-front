<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import ListItem from 'src/features/_base-components/ListItem.vue';
import ListItems from 'src/features/_base-components/listItems.vue';
import ToggleBtn from 'src/features/_base-components/ToggleBtn.vue';

import { useStoreBaseFeatures } from 'stores/base-features';
import { useUserStore } from 'src/features/_utils/user.store';
import { userService } from 'src/_services';
import { Building, Apartment, CurBuildingDetails } from 'src/utils/interfaces';
import FormComponents from 'src/features/_base-components/FormComponents.vue';
import BuildingDetails from 'src/features/dwelling/components/BuildingDetails.vue';
import MyAvatarOptions from 'src/features/_base-components/MyAvatarOptions.vue';
import { storeToRefs } from 'pinia';
import MyApartementDetails from 'src/features/dwelling/components/MyApartementDetails.vue';

import { BuildingChoiceType } from 'src/features/_utils/buildingChoice';

//import stores
const baseFeatures = useStoreBaseFeatures();
const userStore = useUserStore();

let { getBuildings, getApartments, getUserProfile } = storeToRefs(userStore);
//all user data ex: profile and current role

//lifes cycles hooks
onMounted((): void => {
  if (getApartments.value != null) {
    userApartments.value = getApartments.value;
  }
  if (getBuildings.value != null) {
    userBuildings.value = getBuildings.value;
  }
});
onMounted(async () => {
  let roles = await getUserProfile?.value?.roles;

  if (roles != undefined && roles.includes('ROLE_SYNDIC_EDIT')) {
    getSyndicBuildings();
  } else {
    loadApartments();
  }
});

//images slider
const slide = ref(1);

//current choice for the toggle of building or apartments
const currentChoice = ref(BuildingChoiceType.apartments);

//function get emits from switch components
function getCurrentChoice(choice: BuildingChoiceType): void {
  currentChoice.value = choice;
}

//building of the user
let userBuildings = ref<Building[]>([]);

//Apartments of the user
let userApartments = ref<Apartment[]>([]);

//Get Appartments and building request from the APi
function loadApartments(): void {
  baseFeatures.enableLoading();
  userService
    .getUserApartments()
    .then(<Response>(response: Response) => {
      userStore.removeUserApartments();
      userStore.removeUserBuildings();
      userService.removeUserApartments;
      userService.removeUserBuildings;

      userApartments.value = response.data;

      if (userBuildings.value.length === 0) {
        userApartments.value.forEach((apart: Apartment) => {
          if (apart && apart.building) {
            userBuildings.value.push(apart.building);
          }
        });
        if (userBuildings.value.length > 0) {
          userService.saveUserBuildings(userBuildings.value);
          userStore.updateUserBuildings(userBuildings.value);
        }
      }
      userService.saveUserApartments(userApartments.value);
      userStore.updateUserApartments(userApartments.value);
      baseFeatures.disableLoading();
    })
    .catch(() => {
      baseFeatures.disableLoading();
    });
}

//get all syndicate's Buildings
function getSyndicBuildings(): void {
  baseFeatures.enableLoading();

  userService
    .getSyndicateBuildings()
    .then(<Response>(response: Response) => {
      userStore.removeUserApartments();
      userStore.removeUserBuildings();
      userService.removeUserApartments;
      userService.removeUserBuildings;
      userBuildings.value = response.data;
      userService.saveUserBuildings(userBuildings.value);
      userStore.updateUserBuildings(userBuildings.value);
      baseFeatures.disableLoading();
    })
    .catch(() => {
      baseFeatures.disableLoading();
    });
}

let componentToDisplay = ref('none');
let displayForm = ref(false);

//get the emits from the Avatar component to display the chosen form
function getCurrFormToDisplay(choice: string): void {
  componentToDisplay.value = choice;
  displayForm.value = true;
}

function closeFormComponent() {
  componentToDisplay.value = 'none';
  displayForm.value = false;
}

let currBuildingSelected = reactive<CurBuildingDetails>({
  id: undefined,
  label: undefined,
});
//select the current building and show the building coponent
function selectBuildingDetails(
  buildingId: number,
  buildingLabel: string
): void {
  getCurrFormToDisplay('building-details');
  currBuildingSelected.id = buildingId;
  currBuildingSelected.label = buildingLabel;
}

let currentApartementSelected = ref<number | undefined>(undefined);
function displayMyApartement(id: number): void {
  currentApartementSelected.value = id;
  getCurrFormToDisplay('mon-appartement');
}
</script>
<template>
  <q-page class="page_container row justify-center">
    <div class="left" :class="{ left_mobile_form: displayForm }">
      <div class="left_header">
        <MyAvatarOptions class="avatar" @display-form="getCurrFormToDisplay">
        </MyAvatarOptions>
      </div>

      <ToggleBtn
        :one-txt="BuildingChoiceType.apartments"
        :two-txt="BuildingChoiceType.buildings"
        @current-choice="getCurrentChoice"
      >
      </ToggleBtn>
      <div class="list-items">
        <!--        Building lists-->
        <ListItems
          v-if="
            userBuildings.length > 0 &&
            currentChoice === BuildingChoiceType.buildings
          "
          :list-items="userBuildings.length > 0 ? userBuildings : []"
        >
          <template #item="{ id, street, number, zipcode, city }">
            <ListItem>
              <template #icons>
                <div class="icon row items-center justify-center">
                  <q-icon
                    name="fa-solid fa-building"
                    round
                    size="sm"
                    color="primary"
                  />
                </div>
              </template>
              <template #infos>
                <span
                  class="item-title"
                >
                  {{ number }} {{ street }}, {{ zipcode }} {{ city }}
                </span>
                <span
                  style="font-size: 13px; font-weight: 300"
                  class="items-baseline"
                >
                  Résidence
                </span>
              </template>
              <template v-slot:actions>
                <q-btn
                  round
                  unelevated
                  color="white"
                  size="sm"
                  text-color="primary"
                  icon="fa-solid fa-angle-right"
                  @click="
                    selectBuildingDetails(id, `${number} ${street}, ${city}`)
                  "
                />
              </template>
            </ListItem>
          </template>
        </ListItems>
        <!--        apartments lists-->
        <ListItems
          v-if="
            userApartments.length > 0 &&
            currentChoice === BuildingChoiceType.apartments
          "
          :list-items="userApartments"
        >
          <template #item="{ id, number, streetName, streetNumber, city }">
            <ListItem class="item">
              <template #icons>
                <div class="icon row items-center justify-center">
                  <q-icon
                    name="fa-solid fa-building-user"
                    round
                    size="sm"
                    color="primary"
                  />
                </div>
              </template>
              <template #infos>
                <span
                  class="item-title"
                >
                  {{ streetNumber }} {{ streetName }}, {{ city }}
                  {{ number ? `N° ${number}` : '' }}
                </span>
                <span
                  style="font-size: 13px; font-weight: 300"
                  class="items-baseline"
                >
                  {{ $t('apartment') }}
                </span>
              </template>
              <template v-slot:actions>
                <q-btn
                  round
                  unelevated
                  color="white"
                  size="sm"
                  text-color="primary"
                  icon="fa-solid fa-angle-right"
                  @click="displayMyApartement(id)"
                />
              </template>
            </ListItem>
          </template>
        </ListItems>
      </div>
    </div>
    <div class="right" :class="{ right_mobile_form: displayForm }">
      <div class="floating-cloud" v-if="componentToDisplay === 'none'">
        <div class="cloud-1">
          <img src="@pub/images/svg/cloud-1.svg" alt="karibou-home-cloud" />
        </div>
        <div class="cloud-2">
          <img src="@pub/images/svg/cloud-2.svg" alt="karibou-home-cloud" />
        </div>
      </div>
      <q-carousel
        v-if="componentToDisplay === 'none'"
        class="carousel"
        animated
        v-model="slide"
        infinite
        autoplay="9000"
        transition="fade"
      >
        <q-carousel-slide
          :name="1"
          img-src="@pub/images/illustration-town-1.png"
        >
        </q-carousel-slide>
        <q-carousel-slide
          :name="2"
          img-src="@pub/images/illustration-town-2.png"
        >
        </q-carousel-slide>
      </q-carousel>
      <FormComponents
        v-if="
          componentToDisplay === 'informations' ||
          componentToDisplay === 'owner-inv' ||
          componentToDisplay === 'tenant-inv'
        "
        @close-form="closeFormComponent()"
        :component="componentToDisplay"
      ></FormComponents>
      <BuildingDetails
        v-if="componentToDisplay === 'building-details'"
        :building-id="currBuildingSelected.id"
        @close-form="closeFormComponent()"
        :building-label="currBuildingSelected.label"
      >
      </BuildingDetails>
      <MyApartementDetails
        v-if="componentToDisplay === 'mon-appartement'"
        @close-form="closeFormComponent()"
        :current-apartement="currentApartementSelected"
      ></MyApartementDetails>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.page_container {
  width: 100%;
  display: flex;
  .left_mobile_form {
    display: none !important;
  }
  .right_mobile_form {
    display: block !important;
  }
  .left {
    flex: 2;
    padding: 50px 30px;
    .list-items {
      max-width: 578px;
      width: 100%;
      margin: 0 auto;
      .item-title{
        font-size: clamp(.5rem,3vw, .8rem);
        font-weight: 500;
        width:fit-content;

      }
    }
    .left_header {
      max-width: 578px;
      width: 100%;
      margin: 15px auto 45px;
      display: flex;
      justify-content: space-between;
      .avatar {
        margin-left: auto;
      }
    }
  }
  .right {
    right: 0;
    border: 2px solid $grey-light;
    width: 100%;
    display: none;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .cloud-1 {
      display: none;
      top: 150px;
      left: 300px;
    }
    .cloud-2 {
      display: none;
      top: 180px;
      left: 100px;
    }
  }
}

@media screen and (min-width: 977px) {
  .page_container {
    .left_mobile_form {
      display: block !important;
    }
    .right_mobile_form {
      display: block !important;
    }
    .left {
      padding: 50px 20px 50px 120px;
      width: 50%;
      min-height: 100vh;
      position: fixed;
      overflow: scroll;
      max-height: 100%;
      left: 0;
    }
    .right {
      display: block;
      width: 50%;
      right: 0;
      min-height: 100vh;
      position: fixed;
      overflow: scroll;
      max-height: 100%;
      .carousel {
        width: 100%;
        height: 100vh;
      }
      .cloud-1,
      .cloud-2 {
        display: block;
        z-index: 1;
        max-width: 100px;
        width: 100%;
        position: absolute;
      }
    }
  }
}
</style>
