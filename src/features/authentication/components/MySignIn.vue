<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  Apartment,
  SyndicateBuilding,
  UserOwnerProfileSignIn,
  UserSyndicateProfileSignIn,
} from 'src/utils/interfaces';
import { useRouter } from 'vue-router';
import { notify } from 'src/utils/utils';
import { accountService } from 'src/_services';
import { useUserStore } from 'src/features/_utils/user.store';
import { AuthChoice, AuthSignInChoice } from '../utils/auth-choice';
import ToggleBtn from 'src/features/_base-components/ToggleBtn.vue';
import MyForm from 'src/features/_base-components/MyForm.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

//vue router actions
const router = useRouter();

const userInfosStore = useUserStore();
const buildingManagerTypeOne = ref(t('buildingManagerTypeOne'));
const buildingManagerTypeTwo = ref(t('buildingManagerTypeTwo'));
const currentAuthChoice = ref(AuthSignInChoice.owner);
const optionsSyndicateType = ref([
  buildingManagerTypeOne.value,
  buildingManagerTypeTwo.value,
]);

const userSyndicateProfileSignIn = ref<UserSyndicateProfileSignIn>({
  firstname: undefined,
  lastname: undefined,
  email: undefined,
  username: undefined,
  password: undefined,
  syndicates: [],
});

onMounted(() => {
  if (accountService.isLogged()) {
    notify('Vous êtes déjà connecté.', 'warning');
    router.push({ name: 'dwelling' });
  }
});

//function to get currentUserInfos
function getCurrentAuthChoice(choice: AuthChoice): void {
  currentAuthChoice.value = choice;
}

function addFormSyndicate(): void {
  const syndicate = {
    street: undefined,
    streetNumber: undefined,
    siret: undefined,
    siren: undefined,
    type: undefined,
    name: undefined,
    buildings: [],
  };
  userSyndicateProfileSignIn.value.syndicates = [
    ...userSyndicateProfileSignIn.value.syndicates,
    syndicate,
  ];
}

function addFormBuilding(index: number): void {
  const building: SyndicateBuilding = {
    city: undefined,
    country: undefined,
    number: undefined,
    street: undefined,
    zipcode: undefined,
  };
  userSyndicateProfileSignIn.value.syndicates[index].buildings?.push(building);
}

const userOwnerProfileSignIn = ref<UserOwnerProfileSignIn>({
  firstname: undefined,
  lastname: undefined,
  email: undefined,
  username: undefined,
  password: undefined,
  properties: [],
  postalAdressName: undefined,
  postalAdressNumber: undefined,
  postalAdressZipCode: undefined,
  postalAdressCity: undefined,
  country: undefined,
});

function addFormPropeties(): void {
  const property: Apartment = {
    rent: undefined,
    streetName: undefined,
    streetNumber: undefined,
    zipCode: undefined,
    city: undefined,
    extraCharge: undefined,
    country: undefined,
  };
  userOwnerProfileSignIn.value.properties = [
    ...userOwnerProfileSignIn.value.properties,
    property,
  ];
}

function checkOwnerValid(): boolean {
  return !!(
    userOwnerProfileSignIn.value.firstname &&
    userOwnerProfileSignIn.value.lastname &&
    userOwnerProfileSignIn.value.email &&
    userOwnerProfileSignIn.value.password &&
    userOwnerProfileSignIn.value.postalAdressNumber &&
    userOwnerProfileSignIn.value.postalAdressCity &&
    userOwnerProfileSignIn.value.country &&
    userOwnerProfileSignIn.value.postalAdressZipCode &&
    userOwnerProfileSignIn.value.postalAdressName
  );
}

function requestSucceed(succeed: boolean) {
  if (succeed) {
    router.push({ name: 'login' });
  }
}
</script>

<template>
  <div class="login-component">
    <ToggleBtn
      :one-txt="AuthSignInChoice.owner"
      :two-txt="AuthSignInChoice.buildingManager"
      @current-choice="getCurrentAuthChoice"
    >
    </ToggleBtn>

    <div class="auth">
      <div v-if="currentAuthChoice === AuthSignInChoice.owner" class="login">
        <p class="form-title q-my-md">{{ $t('baselineSignInAsOwner') }}</p>
        <MyForm
          :request="{ method: 'post', url: 'api/users/individual-owner' }"
          :form-data="userOwnerProfileSignIn"
          @request-succeed="requestSucceed"
        >
          <template #main>
            <q-input
              class="row-input"
              filled
              type="text"
              v-model="userOwnerProfileSignIn.firstname"
              :label="$t('firstName')"
              lazy-rules
            />

            <q-input
              class="row-input"
              filled
              v-model="userOwnerProfileSignIn.lastname"
              type="text"
              :label="$t('lastName')"
              lazy-rules
            />
            <q-input
              class="row-input"
              filled
              v-model="userOwnerProfileSignIn.email"
              type="email"
              :label="$t('email')"
              lazy-rules
            />
            <q-input
              class="row-input"
              filled
              v-model="userOwnerProfileSignIn.username"
              type="text"
              :label="$t('username')"
              lazy-rules
            />
            <q-input
              class="row-input"
              filled
              v-model="userOwnerProfileSignIn.postalAdressName"
              type="text"
              :label="$t('streetName')"
              lazy-rules
            />
            <q-input
              class="row-input"
              filled
              type="number"
              :model-value="Number(userOwnerProfileSignIn.postalAdressNumber)"
              v-model.number="userOwnerProfileSignIn.postalAdressNumber"
              :label="$t('streetNumber')"
            />
            <q-input
              class="row-input"
              filled
              v-model="userOwnerProfileSignIn.postalAdressZipCode"
              type="number"
              :model-value="Number(userOwnerProfileSignIn.postalAdressZipCode)"
              v-model.number="userOwnerProfileSignIn.postalAdressZipCode"
              :label="$t('zipCode')"
              lazy-rules
            />
            <q-input
              class="row-input"
              filled
              v-model="userOwnerProfileSignIn.postalAdressCity"
              type="text"
              :label="$t('city')"
              lazy-rules
            />
            <q-input
              class="row-input"
              filled
              v-model="userOwnerProfileSignIn.country"
              type="text"
              :label="$t('country')"
              lazy-rules
            />
            <q-input
              class="row-input"
              filled
              v-model="userOwnerProfileSignIn.password"
              type="password"
              :label="$t('password')"
              lazy-rules
            />
            <div class="form-drop_down q-mt-ms">
              <div class="form-drop_down-header">
                <span class="drop_down_title">{{ $t('apartments') }}</span>
                <div class="actions">
                  <q-icon
                    @click="addFormPropeties()"
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
                    @click="userOwnerProfileSignIn.properties.pop()"
                    v-if="userOwnerProfileSignIn.properties.length > 0"
                    color="primary"
                  />
                </div>
              </div>
              <q-separator />
              <div class="form-drop_down-main q-pt-xs">
                <ul class="drop_down-row-container">
                  <li
                    v-for="(
                      property, index
                    ) in userOwnerProfileSignIn.properties"
                    :key="index"
                    class="drop_down-row q-mb-md"
                  >
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
        </MyForm>
      </div>

      <div
        v-if="currentAuthChoice === AuthSignInChoice.buildingManager"
        class="login"
      >
        <p class="form-title q-my-md">
          {{ $t('baselineSignInBuildingManager') }}
        </p>
        <MyForm
          :request="{ method: 'post', url: 'api/users/syndicate' }"
          :form-data="userSyndicateProfileSignIn"
          @request-succeed="requestSucceed"
        >
          <template #main>
            <q-input
              class="row-input"
              filled
              type="text"
              v-model="userSyndicateProfileSignIn.firstname"
              :model-value="
                userSyndicateProfileSignIn.firstname === ''
                  ? (userSyndicateProfileSignIn.firstname = undefined)
                  : userSyndicateProfileSignIn.firstname
              "
              :label="$t('firstName')"
            />

            <q-input
              class="row-input"
              filled
              v-model="userSyndicateProfileSignIn.lastname"
              type="text"
              :label="$t('lastName')"
              lazy-rules
            />
            <q-input
              class="row-input"
              filled
              v-model="userSyndicateProfileSignIn.email"
              type="text"
              :label="$t('email')"
              lazy-rules
            />
            <q-input
              class="row-input"
              filled
              v-model="userSyndicateProfileSignIn.username"
              type="text"
              :label="$t('username')"
              lazy-rules
            />
            <q-input
              class="row-input"
              filled
              v-model="userSyndicateProfileSignIn.password"
              type="password"
              :label="$t('password')"
              lazy-rules
            />
            <div class="form-drop_down q-mt-ms">
              <div class="form-drop_down-header">
                <span class="drop_down_title">{{ $t('buildingManager') }}</span>
                <div class="actions">
                  <q-icon
                    v-if="userSyndicateProfileSignIn.syndicates.length < 1"
                    @click="addFormSyndicate()"
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
                    @click="userSyndicateProfileSignIn.syndicates.pop()"
                    v-if="userSyndicateProfileSignIn.syndicates.length > 0"
                    color="primary"
                  />
                </div>
              </div>
              <q-separator />
              <div class="form-drop_down-main q-pt-xs">
                <ul class="drop_down-row-container">
                  <li
                    v-for="(
                      syndicate, index
                    ) in userSyndicateProfileSignIn.syndicates"
                    :key="index"
                    class="drop_down-row q-mb-md"
                  >
                    <q-input
                      class="row-input q-mb-sm"
                      filled
                      dense
                      type="text"
                      :model-value="syndicate.name"
                      v-model.text="syndicate.name"
                      :label="$t('buildingManagerName')"
                    />
                    <q-input
                      class="row-input q-mb-sm"
                      filled
                      dense
                      type="text"
                      :model-value="syndicate.street"
                      v-model.text="syndicate.street"
                      :label="$t('streetName')"
                    />
                    <q-input
                      class="row-input q-mb-sm"
                      filled
                      dense
                      :model-value="syndicate.streetNumber"
                      type="number"
                      v-model.number="syndicate.streetNumber"
                      :label="$t('streetNumber')"
                    />
                    <q-input
                      class="row-input q-mb-sm"
                      filled
                      dense
                      :model-value="syndicate.siret"
                      v-model.text="syndicate.siret"
                      type="text"
                      :label="$t('serialSiretMatriculation')"
                    />
                    <q-input
                      class="row-input q-mb-sm"
                      filled
                      dense
                      :model-value="syndicate.siren"
                      v-model.text="syndicate.siren"
                      type="text"
                      :label="$t('serialSirenMatriculation')"
                    />
                    <q-select
                      filled
                      dense
                      v-model="syndicate.type"
                      :options="optionsSyndicateType"
                      :label="$t('buildingManagerType')"
                    />
                    <div class="form-drop_down q-my-md">
                      <div class="form-drop_down-header">
                        <span class="drop_down_title">{{
                          $t('buildings')
                        }}</span>
                        <div class="actions">
                          <q-icon
                            @click="addFormBuilding(index)"
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
                            @click="syndicate.buildings?.pop()"
                            v-if="syndicate.buildings?.length > 0"
                            color="primary"
                          />
                        </div>
                      </div>
                      <q-separator />
                      <div class="form-drop_down-main q-my-md">
                        <ul class="drop_down-row-container">
                          <li
                            v-for="(building, index) in syndicate.buildings"
                            :key="index"
                            class="drop_down-row q-mb-md"
                          >
                            <q-input
                              class="row-input q-mb-sm"
                              filled
                              dense
                              type="text"
                              :model-value="building.city"
                              v-model.text="building.city"
                              :label="$t('city')"
                            />
                            <q-input
                              class="row-input q-mb-sm"
                              filled
                              dense
                              type="text"
                              :model-value="building.country"
                              v-model.text="building.country"
                              :label="$t('country')"
                            />
                            <q-input
                              class="row-input q-mb-sm"
                              filled
                              dense
                              :model-value="building.street"
                              v-model.text="building.street"
                              type="text"
                              :label="$t('streetName')"
                            />
                            <q-input
                              class="row-input q-mb-sm"
                              filled
                              dense
                              :model-value="building.number"
                              type="number"
                              v-model.number="building.number"
                              :label="$t('streetNumber')"
                            />

                            <q-input
                              class="row-input q-mb-sm"
                              filled
                              dense
                              :model-value="building.zipcode"
                              type="number"
                              v-model.number="building.zipcode"
                              :label="$t('zipCode')"
                            />
                          </li>
                        </ul>
                      </div>
                    </div>
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
        </MyForm>
      </div>
    </div>
    <div class="already-sign-up q-my-md text-center">
      <router-link :to="{ name: 'login' }">{{
        $t('alreadySignUp')
      }}</router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-component {
  max-width: 470px;
  margin: 0 auto;

  .form-title {
    text-align: center;
    font-size: var(--fs-500);
    font-weight: 400;
    color: $secondary;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .row-input {
    width: 100%;
  }

  .drop_down-row-container {
    padding-left: 10px;
  }

  .form-drop_down-header {
    display: flex;
    justify-content: space-between;
  }
  .already-sign-up > * {
    text-decoration: none;
    color: black;
  }
}
</style>
