<script setup lang="ts">
import MyAvatarOptions from 'src/features/_base-components/MyAvatarOptions.vue';
import { onMounted, ref, watch } from 'vue';
import FormComponents from 'src/features/_base-components/FormComponents.vue';
import PropertyDetails from 'src/features/_base-components/PropertyDetails.vue';
import { useStoreBaseFeatures } from 'stores/base-features';
import { ApartmentStore } from 'stores/apartment.store';
import { rentReceiptService, userService } from 'src/_services';
import { useUserStore } from 'src/features/_utils/user.store';
import { storeToRefs } from 'pinia';
import ListItems from 'src/features/_base-components/listItems.vue';
import ListItem from 'src/features/_base-components/ListItem.vue';
import { setLocaleLangFormat } from 'src/utils/date-picker.service';
import { date } from 'quasar';
import { useI18n } from 'vue-i18n';
import { Apartment, RentReceipt } from 'src/utils/interfaces';
import { RolesUser } from 'src/utils/rolesUser.enum';

const { locale } = useI18n({ useScope: 'global' });
const userStore = useUserStore();
const { getUserProfile, getApartments } = storeToRefs(userStore);
const userApartments = ref<Apartment[]>([]);
const baseFeatures = useStoreBaseFeatures();

const apartmentUpdate = ApartmentStore();
const { getApartmentsChange } = storeToRefs(apartmentUpdate);

watch(getApartmentsChange, (): void => {
  loadApartments();
});

onMounted(() => {
  if (getApartments.value) {
    userApartments.value = getApartments.value;
  }
});
const slide = ref(1);

let displayForm = ref(false);
let componentToDisplay = ref('none');

function getCurrFormToDisplay(choice: string): void {
  componentToDisplay.value = choice;
  displayForm.value = true;
}

function closeFormComponent() {
  componentToDisplay.value = 'none';
  displayForm.value = false;
}

//get all rent receipt from the current user connected
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
      userService.saveUserApartments(userApartments.value);
      userStore.updateUserApartments(userApartments.value);
      baseFeatures.disableLoading();
    })
    .catch(() => {
      baseFeatures.disableLoading();
    });
}

function translateDate(rentReceiptdate: string) {
  return date.formatDate(
    rentReceiptdate,
    'MMMM',
    setLocaleLangFormat(locale.value)
  );
}

async function onClickTenantPayed(rentReceipt: RentReceipt) {
  if (!rentReceipt.payed) {
    const body = {
      rentReceiptId: rentReceipt.id,
      lang: locale.value,
    };
    await rentReceiptService.setTenantPayedRent(body).then((res) => {
      apartmentUpdate.updateApartmentChange();
    });
  }
}
</script>

<template>
  <q-page class="receipt row justify-center">
    <div class="left" :class="{ left_mobile_form: displayForm }">
      <div class="left_header">
        <MyAvatarOptions class="avatar" @display-form="getCurrFormToDisplay">
        </MyAvatarOptions>
      </div>
      <PropertyDetails
        class="header_banner"
        icon="fa-solid fa-bullhorn"
        component-title="myRentReceiptTitle"
        type="myRentReceiptSubTitle"
      >
        <template #actions>
          <q-icon
            name="fa-solid fa-arrows-rotate"
            round
            size="sm"
            color="primary"
            class="cursor-pointer"
            @click="loadApartments()"
          />
          <q-icon
            v-if="getUserProfile?.roles.includes('ROLE_OWNER_EDIT')"
            name="fa-solid fa-add"
            round
            size="sm"
            color="primary"
            class="cursor-pointer"
            @click="getCurrFormToDisplay('new-receipt')"
          />
        </template>
      </PropertyDetails>

      <div class="list-items" v-if="userApartments.length > 0">
        <ListItems :list-items="userApartments">
          <template #item="apart">
            <div
              class="apartment-information"
              v-if="apart.rentReceipts.length > 0"
            >
              <q-icon
                name="fa-solid fa-building-user"
                round
                size="xs"
                color="primary"
              />
              <span>
                {{ apart?.streetNumber }} {{ apart.streetName }},{{
                  apart.city
                }}
              </span>
            </div>
            <ListItems :list-items="apart?.rentReceipts">
              <template #item="item">
                <ListItem>
                  <template #icons>
                    <div class="icon row items-center justify-center">
                      <q-icon
                        size="sm"
                        color="primary"
                        class="btn-back"
                        name="fa-solid fa-file-invoice"
                      />
                    </div>
                  </template>
                  <template #infos>
                    <span
                      style="font-size: 14px; font-weight: 600"
                      class="item-title"
                    >
                      {{ $t('rentReceipt') }}
                      {{ translateDate(item.receiptDate) }}
                    </span>
                    <span>
                      {{ $t('payed') }} {{ item.tenant.firstname }}
                      {{ item.tenant.lastname }}</span
                    >
                  </template>
                  <template v-slot:actions>
                    <a target="_blank" :href="item.file">
                      <q-icon
                        round
                        v-if="item.payed"
                        name="fa-solid fa-download"
                        unelevated
                        color="primary"
                        size="xs"
                        text-color="primary"
                      >
                      </q-icon>
                    </a>
                    <q-btn
                      v-if="getUserProfile.roles.includes(RolesUser.owner)"
                      round
                      unelevated
                      color="white"
                      size="sm"
                      :text-color="item.payed ? 'green' : 'grey'"
                      @click="onClickTenantPayed(item)"
                      icon="fa-solid fa-circle-check"
                    />
                    <q-icon
                      round
                      v-if="
                        getUserProfile.roles.includes(RolesUser.tenant) &&
                        !item.payed
                      "
                      name="fa-solid fa-circle-xmark"
                      unelevated
                      color="red"
                      size="xs"
                      text-color="primary"
                    >
                    </q-icon>
                  </template>
                </ListItem>
              </template>
            </ListItems>
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
          componentToDisplay === 'add-conversation' ||
          componentToDisplay === 'new-receipt' ||
          componentToDisplay === 'tenant-inv'
        "
        @close-form="closeFormComponent()"
        :component="componentToDisplay"
      ></FormComponents>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.receipt {
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
    .header_banner {
      max-width: 658px;
      margin: 30px auto;
    }
    .list-items {
      max-width: 578px;
      width: 100%;
      margin: 0 auto;

      .apartment-information {
        display: flex;
        gap: 10px;
        align-items: center;
        border-bottom: 1px solid #e8e8e8;
        padding: 10px 0;
      }
    }
    .left_header {
      max-width: 658px;
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
  .receipt {
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
