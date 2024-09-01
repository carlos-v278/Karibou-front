<script setup lang="ts">
import DefaultForm from 'src/features/_base-components/DefaultForm.vue';
import { onBeforeMount, onMounted, reactive, ref, watch } from 'vue';
import {
  Apartment,
  Building,
  BuildingsOptions,
  localDateLang,
  NewRentReceipt,
  OwnerInfosInvit,
  PostAdvertisement,
  TenantInfosInvit,
  tenantOption,
  UserProfileEdit,
} from 'src/utils/interfaces';
import { storeToRefs } from 'pinia';
import { useUserStore } from 'src/features/_utils/user.store';
import AddAdvertisement from 'src/features/advertisements/components/AddAdvertisement.vue';
import { useRoute } from 'vue-router';
import { AdvertisementType } from 'src/features/_utils/advertisementType';
import { useI18n } from 'vue-i18n';
import { setLocaleLangFormat } from 'src/utils/date-picker.service';
import { ApartmentStore } from 'src/stores/apartment.store';

const route = useRoute();
const { t } = useI18n();

//import stores
const userData = useUserStore();

const apartmentUpdate = ApartmentStore();

onBeforeMount(() => {
  localDateFormat.value = setLocaleLangFormat(locale.value);
});

onMounted(() => {
  getBuildings.value?.forEach((building: Building, index) => {
    buildingOptions.value[index] = {
      uriId: '/api/buildings/' + building.id,
      label: `${building.number} ${building.street}, ${building.city} ${building.zipcode}`,
    };
  });

  getApartments.value?.forEach((apartment: Apartment, index) => {
    apartmentsOptions.value[index] = {
      uriId: '/api/apartments/' + apartment.id,
      label: `${apartment.streetNumber} ${apartment.streetName}, ${apartment.city}`,
    };
  });

  advertisementForm.value.owner = '/api/users/' + getUserProfile.value?.id;
  advertisementForm.value.building = '/api/buildings/' + route.params.id;
});

//all user data ex: profile and current role
const { getUserProfile, getBuildings, getApartments } = storeToRefs(userData);

const props = defineProps({
  component: {
    type: String,
  },
});

const emits = defineEmits(['closeform']);

// personal profile informations to edit
const profileInfosEdit = reactive<UserProfileEdit>({
  firstname: undefined,
  lastname: undefined,
  username: undefined,
  password: undefined,
});

//update user profile picture
const formPicture = ref<Blob | MediaSource | object>({});

// owner informations to invite
const ownerInfosInvit = reactive<OwnerInfosInvit>({
  email: undefined,
  username: undefined,
  firstname: undefined,
  lastname: undefined,
  postalAdressName: undefined,
  postalAdressNumber: undefined,
  postalAdressZipCode: undefined,
  postalAdressCity: undefined,
  country: undefined,
  properties: [],
});

//tenant informations to invite
const tenantInfosInvit = reactive<TenantInfosInvit>({
  email: undefined,
  username: undefined,
  firstname: undefined,
  lastname: undefined,
  location: undefined,
  postalAdressName: undefined,
  postalAdressNumber: undefined,
  postalAdressZipCode: undefined,
  postalAdressCity: undefined,
  country: undefined,
});

function addProperties(): void {
  const property: Apartment = {
    number: 0,
    floor: 0,
    rent: 0,
    building: '',
    streetName: undefined,
    streetNumber: undefined,
    zipCode: undefined,
    city: undefined,
    extraCharge: undefined,
    country: undefined,
  };
  ownerInfosInvit.properties = [...ownerInfosInvit.properties, property];
}

const buildingOptions = ref<BuildingsOptions[]>([]);
const apartmentsOptions = ref<BuildingsOptions[]>([]);
const currBuildChoice = ref({
  uriId: '',
  label: '',
});

const currApartChoice = ref({
  uriId: '',
  label: '',
});

function upCurrBuilChoice(apartmentIndex: number): void {
  ownerInfosInvit.properties[apartmentIndex].building =
    currBuildChoice.value.uriId;
}
function upCurrApartChoice(): void {
  tenantInfosInvit.location = currApartChoice.value.uriId;
}

// advertisement form
const advertisementForm = ref<PostAdvertisement>({
  title: undefined,
  description: '',
  price: undefined,
  type: undefined,
  building: undefined,
  owner: undefined,
});

const sellType = ref(t(AdvertisementType.sell));
const jobType = ref(t(AdvertisementType.job));
const informationType = ref(t(AdvertisementType.information));
const advertisementTypeOptions = ref([
  sellType.value,
  jobType.value,
  informationType.value,
]);

const formPictures = ref<File[]>([]);
function addAdvertisementPicture(): void {
  const newfile = {
    lastModified: 0,
    name: '',
    webkitRelativePath: '',
  };
  formPictures.value.push(newfile as File);
}

//date picker configuration
const { locale } = useI18n({ useScope: 'global' });
const selectedDate = ref(null);
const newRentReceipt = ref<NewRentReceipt>({
  apartment: null,
  apartmentId: undefined,
  selectedDate: undefined,
  rent: 0,
  tenantId: undefined,
  lang: locale.value,
});
function apartmentRentReceipt() {
  if (newRentReceipt.value.apartment !== null) {
    newRentReceipt.value.apartmentId = returnNumberRegex(
      newRentReceipt.value.apartment.uriId
    );
    const findIndexApartment = getApartments.value?.findIndex(
      (apartment: Apartment) =>
        apartment.id === newRentReceipt.value.apartmentId
    );
    if (getApartments.value !== null) {
      newRentReceipt.value.rent =
        getApartments.value[findIndexApartment as number].rent;
    }
    selectTenantAfterApartment();
  }
}
const localDateFormat = ref<localDateLang>();

watch(locale, (): void => {
  localDateFormat.value = setLocaleLangFormat(locale.value);
  newRentReceipt.value.lang = locale.value;
});

const tenantsOptions = ref<tenantOption[]>([]);
const currTenantChoice = ref<tenantOption>({
  id: undefined,
  label: '',
});

function returnNumberRegex(inputString: string): number | undefined {
  const match = inputString.match(/\d+/);
  if (match) {
    return parseInt(match[0], 10);
  }
  return undefined;
}

function selectTenantAfterApartment(): void {
  getApartments.value?.forEach((apartment) => {
    if (
      apartment.id === newRentReceipt.value.apartmentId &&
      apartment.tenants
    ) {
      tenantsOptions.value = [];
      apartment.tenants.forEach((tenant: tenants) => {
        const tenantOption: tenantOption = {
          id: tenant.id,
          label: `${tenant.firstname} ${tenant.lastname}`,
        };
        tenantsOptions.value = [...tenantsOptions.value, tenantOption];
      });
    }
  });
}

function selectTenant(tenant: tenantOption): void {
  currTenantChoice.value = tenant;
  if (currTenantChoice.value.id) {
    newRentReceipt.value.tenantId = currTenantChoice.value.id;
  }
}

function dateToTimeStamp() {
  const date = new Date(selectedDate.value);
  const dateToTimeStamp = Math.floor(date.getTime() / 1000);
  newRentReceipt.value.selectedDate = dateToTimeStamp;
}

function checkFieldRequire(): boolean {
  return !!(
    (newRentReceipt.value.apartmentId &&
      newRentReceipt.value.tenantId &&
      newRentReceipt.value.rent &&
      newRentReceipt.value.selectedDate) ||
    (ownerInfosInvit.firstname &&
      ownerInfosInvit.lastname &&
      ownerInfosInvit.email &&
      ownerInfosInvit.username &&
      ownerInfosInvit.properties.length > 0) ||
    (tenantInfosInvit.firstname &&
      tenantInfosInvit.lastname &&
      tenantInfosInvit.email &&
      tenantInfosInvit.username &&
      tenantInfosInvit.location)
  );
}

function rentReceiptRequestSucced() {
  apartmentUpdate.updateApartmentChange();
  emits('closeForm');
}
</script>
<template>
  <div class="components_container">
    <DefaultForm
      v-if="props.component === 'informations'"
      :title="$t('editYourInformation')"
      @go-back="emits('closeForm')"
      :request="{ method: 'patch', url: `api/users/${getUserProfile?.id}` }"
      :form-data="profileInfosEdit"
      :form-image="formPicture"
    >
      <template #header>
        <div class="row avatar-edit no-wrap items-center">
          <q-file
            color="lime-11"
            bg-color="grey-light"
            filled
            :label="$t('profilePicture')"
            style="width: 100%"
            v-model="formPicture"
          >
            <template v-slot:prepend>
              <q-icon name="attachment" />
            </template>
          </q-file>
        </div>
      </template>
      <template #main>
        <q-input
          class="row-input"
          filled
          type="text"
          v-model="profileInfosEdit.firstname"
          :model-value="
            profileInfosEdit.firstname === ''
              ? (profileInfosEdit.firstname = undefined)
              : profileInfosEdit.firstname
          "
          :label="$t('firstName')"
        />

        <q-input
          class="row-input"
          filled
          v-model="profileInfosEdit.lastname"
          type="text"
          :label="$t('lastName')"
          lazy-rules
        />
        <q-input
          class="row-input"
          filled
          v-model="profileInfosEdit.username"
          type="text"
          :label="$t('username')"
          lazy-rules
        />
        <q-input
          class="row-input"
          filled
          v-model="profileInfosEdit.password"
          type="password"
          :label="$t('password')"
          lazy-rules
        />
      </template>
      <template #footer>
        <q-btn
          class="row-input btn-cta"
          :label="$t('edit')"
          type="submit"
          color="primary"
        />
      </template>
    </DefaultForm>
    <DefaultForm
      v-if="props.component === 'owner-inv'"
      :title="$t('ownerInvitation')"
      @go-back="emits('closeForm')"
      :request="{ method: 'post', url: 'api/users/owner' }"
      :form-data="ownerInfosInvit"
    >
      <template #main>
        <q-input
          class="row-input"
          filled
          type="text"
          v-model="ownerInfosInvit.firstname"
          :label="$t('firstName')"
        />
        <q-input
          class="row-input"
          filled
          type="text"
          v-model="ownerInfosInvit.lastname"
          :label="$t('lastName')"
        />
        <q-input
          class="row-input"
          filled
          type="email"
          v-model="ownerInfosInvit.email"
          :label="$t('email')"
        />
        <q-input
          class="row-input"
          filled
          type="text"
          v-model="ownerInfosInvit.username"
          :label="$t('username')"
        />
        <q-input
          class="row-input"
          filled
          v-model="ownerInfosInvit.postalAdressName"
          type="text"
          :label="$t('streetName')"
          lazy-rules
          />
          <q-input
              class="row-input"
              filled
              type="number"
              v-model.number="ownerInfosInvit.postalAdressNumber"
              :label="$t('streetNumber')"
          />
          <q-input
            class="row-input"
            filled
            type="number"
            v-model.number="ownerInfosInvit.postalAdressZipCode"
            :label="$t('zipCode')"
            lazy-rules
          />
          <q-input
            class="row-input"
            filled
            v-model="ownerInfosInvit.postalAdressCity"
            type="text"
            :label="$t('city')"
            lazy-rules
          />
          <q-input
            class="row-input"
            filled
            v-model="ownerInfosInvit.country"
            type="text"
            :label="$t('country')"
            lazy-rules
          />
        <div class="form-drop_down">
          <div class="form-drop_down-header">
            <span class="drop_down_title">{{ $t('apartments') }}</span>
            <div class="actions">
              <q-icon
                @click="addProperties()"
                class="btn-add-apartment cursor-pointer"
                name="fa-solid fa-plus"
                round
                size="xs"
                color="primary"
              />
              <q-icon
                class="btn-add-apartment cursor-pointer q-ml-md"
                name="fa-solid fa-minus"
                round
                size="xs"
                @click="ownerInfosInvit.properties.pop()"
                v-if="ownerInfosInvit.properties.length > 0"
                color="primary"
              />
            </div>
          </div>
          <q-separator />
          <div class="form-drop_down-main q-pt-xs">
            <ul class="drop_down-row-container">
              <li
                v-for="(property, index) in ownerInfosInvit.properties"
                :key="index"
                class="drop_down-row q-mb-md"
              >
                <q-input
                  class="row-input q-mb-sm"
                  filled
                  dense
                  type="number"
                  v-model.number="property.number"
                  :label="$t('number')"
                />
                <q-input
                  class="row-input q-mb-sm"
                  filled
                  dense
                  type="number"
                  v-model.number="property.floor"
                  :label="$t('floor')"
                />
                <q-input
                  class="row-input q-mb-sm"
                  filled
                  dense
                  type="number"
                  v-model.number="property.rent"
                  :label="$t('rent')"
                />
                <q-input
                  class="row-input q-mb-sm"
                  filled
                  dense
                  type="text"
                  v-model.text="property.streetName"
                  :label="$t('streetName')"
                />
                <q-input
                  class="row-input q-mb-sm"
                  filled
                  dense
                  type="number"
                  v-model.number="property.streetNumber"
                  :label="$t('streetNumber')"
                />
                <q-input
                  class="row-input q-mb-sm"
                  filled
                  dense
                  type="text"
                  v-model.text="property.city"
                  :label="$t('city')"
                />
                <q-input
                  class="row-input q-mb-sm"
                  filled
                  dense
                  type="number"
                  v-model.number="property.zipCode"
                  :label="$t('zipCode')"
                />
                <q-input
                  class="row-input q-mb-sm"
                  filled
                  dense
                  type="text"
                  v-model.text="property.country"
                  :label="$t('country')"
                />
                <q-input
                  class="row-input q-mb-sm"
                  filled
                  dense
                  type="number"
                  v-model.number="property.rent"
                  :label="$t('rent')"
                />
                <q-input
                  class="row-input q-mb-sm"
                  filled
                  dense
                  type="number"
                  v-model.number="property.extraCharge"
                  :label="$t('extraCharges')"
                />
                <q-select
                  filled
                  dense
                  v-model="currBuildChoice"
                  :options="buildingOptions"
                  @update:modelValue="upCurrBuilChoice(index)"
                  :label="$t('building')"
                />
              </li>
            </ul>
          </div>
        </div>
      </template>
      <template #footer>
        <q-btn
          class="row-input btn-cta"
          :label="$t('invite')"
          type="submit"
          color="primary"
        />
      </template>
    </DefaultForm>
    <DefaultForm
      v-if="props.component === 'tenant-inv'"
      :title="$t('tenantInvitation')"
      @go-back="emits('closeForm')"
      :request="{ method: 'post', url: 'api/users/tenant' }"
      :form-data="tenantInfosInvit"
    >
      <template #main>
        <q-input
          class="row-input"
          filled
          type="text"
          v-model="tenantInfosInvit.firstname"
          :label="$t('firstName')"
        />
        <q-input
          class="row-input"
          filled
          type="text"
          v-model="tenantInfosInvit.lastname"
          :label="$t('lastName')"
        />
        <q-input
          class="row-input"
          filled
          type="email"
          v-model="tenantInfosInvit.email"
          :label="$t('email')"
        />
        <q-input
          class="row-input"
          filled
          type="text"
          v-model="tenantInfosInvit.username"
          :label="$t('username')"
        />
        <q-input
          class="row-input"
          filled
          v-model="tenantInfosInvit.postalAdressName"
          type="text"
          :label="$t('streetName')"
          lazy-rules
          />
          <q-input
              class="row-input"
              filled
              type="number"
              v-model.number="tenantInfosInvit.postalAdressNumber"
              :label="$t('streetNumber')"
          />
          <q-input
            class="row-input"
            filled
            type="number"
            v-model.number="tenantInfosInvit.postalAdressZipCode"
            :label="$t('zipCode')"
            lazy-rules
          />
          <q-input
            class="row-input"
            filled
            v-model="tenantInfosInvit.postalAdressCity"
            type="text"
            :label="$t('city')"
            lazy-rules
          />
          <q-input
            class="row-input"
            filled
            v-model="tenantInfosInvit.country"
            type="text"
            :label="$t('country')"
            lazy-rules
          />
        <q-select
          filled
          dense
          v-model="currApartChoice"
          :options="apartmentsOptions"
          @update:modelValue="upCurrApartChoice()"
          :label="$t('apartment')"
        />
      </template>
      <template #footer>
        <q-btn
          v-if="checkFieldRequire()"
          class="row-input btn-cta"
          label="Inviter"
          type="submit"
          color="primary"
        />
      </template>
    </DefaultForm>
    <AddAdvertisement
      v-if="props.component === 'add-advertisement'"
      :title="$t('publishOneAd')"
      @go-back="emits('closeForm')"
      :request="{ method: 'post', url: `api/advertisements` }"
      :form-data="advertisementForm"
      :form-images="formPictures"
    >
      <template #main>
        <q-input
          class="row-input"
          filled
          type="text"
          v-model="advertisementForm.title"
          :label="$t('title')"
        />

        <q-editor v-model="advertisementForm.description"></q-editor>
        <q-input
          class="row-input"
          filled
          type="number"
          v-model.number="advertisementForm.price"
          :label="$t('price')"
        />
        <q-select
          filled
          dense
          v-model="advertisementForm.type"
          :options="advertisementTypeOptions"
          :label="$t('type')"
        />
        <div class="form-drop_down q-mt-xs">
          <div class="form-drop_down-header">
            <span class="drop_down_title">{{ $t('images') }}</span>
            <div class="actions">
              <q-icon
                @click="addAdvertisementPicture()"
                class="btn-add-apartment cursor-pointer"
                name="fa-solid fa-plus"
                round
                size="xs"
                color="primary"
              />

              <q-icon
                class="btn-add-apartment cursor-pointer q-ml-md"
                name="fa-solid fa-minus"
                round
                size="xs"
                @click="formPictures.pop()"
                v-if="formPictures.length > 0"
                color="primary"
              />
            </div>
          </div>
          <q-separator />
          <div class="form-drop_down-main q-pt-xs">
            <ul class="drop_down-row-container">
              <li
                v-for="(picture, index) in formPictures"
                :key="index"
                class="drop_down-row q-mb-md"
              >
                <q-file
                  color="lime-11"
                  bg-color="grey-light"
                  filled
                  :label="$t('image')"
                  style="width: 100%"
                  v-model="formPictures[index]"
                >
                  <template v-slot:prepend>
                    <q-icon name="attachment" />
                  </template>
                </q-file>
              </li>
            </ul>
          </div>
        </div>
      </template>
      <template #footer>
        <q-btn
          class="row-input btn-cta"
          :label="$t('submit')"
          type="submit"
          color="primary"
        />
      </template>
    </AddAdvertisement>
    <DefaultForm
      v-if="props.component === 'add-conversation'"
      title="Commencer une conversation avec "
      @go-back="emits('closeForm')"
      :request="{ method: 'post', url: 'api/users/conversations' }"
      :form-data="tenantInfosInvit"
    >
      <template #main>
        <q-select
          filled
          dense
          v-model="currApartChoice"
          :options="apartmentsOptions"
          @update:modelValue="upCurrApartChoice()"
          label="Batiment"
        />
      </template>
      <template #footer>
        <q-btn
          class="row-input btn-cta"
          label="Inviter"
          type="submit"
          color="primary"
        />
      </template>
    </DefaultForm>
    <DefaultForm
      v-if="props.component === 'new-receipt'"
      :title="$t('nesRentReceiptTitle')"
      @go-back="emits('closeForm')"
      :request="{ method: 'post', url: 'api/rent_receipts' }"
      :form-data="newRentReceipt"
      @request-succeed="rentReceiptRequestSucced()"
    >
      <template #main>
        <q-date
          dense
          landscape
          class="date-picker"
          v-model="selectedDate"
          @update:modelValue="dateToTimeStamp()"
          :locale="localDateFormat"
        />
        <q-select
          filled
          dense
          v-model="newRentReceipt.apartment"
          :options="apartmentsOptions"
          @update:modelValue="apartmentRentReceipt"
          :label="$t('apartment')"
        />
        <q-input
          class="row-input"
          filled
          type="number"
          :model-value="Number(newRentReceipt.rent)"
          v-model.number="newRentReceipt.rent"
          :label="$t('rent')"
        />
        <q-select
          filled
          dense
          v-if="newRentReceipt.apartment"
          v-model="currTenantChoice"
          :options="tenantsOptions"
          @update:modelValue="selectTenant"
          :label="$t('tenants')"
        />
      </template>
      <template #footer>
        <q-btn
          class="row-input btn-cta"
          :disable="!checkFieldRequire()"
          :label="t('submit')"
          type="submit"
          color="primary"
        />
      </template>
    </DefaultForm>
  </div>
</template>

<style lang="scss" scoped>
.components_container {
  width: 100%;
  .form-drop_down {
    margin: 10px 0;

    .form-drop_down-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .drop_down_title {
        font-size: 1.1rem;
        font-weight: 500;
      }
    }
    .form-drop_down-main {
      .drop_down-row-container {
        list-style: none;
        padding: 0 0 0 15px;
      }
    }
  }
}
.date-picker {
  margin: 0 auto 20px;
}
@media screen and (min-width: 977px) {
  .components_container {
    width: 100%;
  }
}
</style>
