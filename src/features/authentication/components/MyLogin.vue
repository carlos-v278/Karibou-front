<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { UserAuth } from 'src/utils/interfaces';
import { useRouter } from 'vue-router';
import { notify } from 'src/utils/utils';
import { accountService, userService } from 'src/_services';
import { useUserStore } from 'src/features/_utils/user.store';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

//vue router actions
const router = useRouter();

const userInfosStore = useUserStore();

onMounted(() => {
  if (accountService.isLogged()) {
    notify('Vous êtes déjà connecté.', 'warning');
    router.push({ name: 'dwelling' });
  }
});

// login form data
const user = reactive<UserAuth>({
  email: undefined,
  password: undefined,
});

//submit the login form
async function onSubmit(): Promise<void> {
  login();
}

async function login() {
  await accountService
    .login(user)
    .then(async (res) => {
      if (res.status == 200) {
        accountService.saveToken(res.data?.token);
        await getProfileInfos();
      } else {
        notify('Email ou Mot de-DE passe incorrect.', 'negative');
      }
    })
    .catch((err) => {
      notify('Email ou Mot de-DE passe incorrect.', 'negative');
    });
}

//function to get currentUserInfos
async function getProfileInfos() {
  await userService.getUserProfile().then((res) => {
    userService.saveUserProfile(res.data);
    userInfosStore.updateUserProfile(res.data);
    notify(`Bienvenue ${user.email}.`, 'positive');
    router.push({ name: 'dwelling' });
  });
}
</script>

<template>
  <div class="login-component">
    <div class="auth">
      <div class="login">
        <h2 class="form-title">{{ $t('loginInfoBaseline') }}</h2>
        <q-form class="login-form" @submit="onSubmit">
          <q-input
            class="row-input"
            filled
            type="email"
            v-model="user.email"
            :label="$t('email')"
            lazy-rules
          />

          <q-input
            class="row-input"
            filled
            type="password"
            v-model="user.password"
            :label="$t('password')"
          />
          <q-btn
            class="row-input btn-cta"
            :label="$t('login')"
            type="submit"
            color="primary"
          />
        </q-form>
      </div>
      <div class="not-already-sign-in q-my-md text-center">
        <router-link :to="{ name: 'signIn' }">{{
          $t('notAlreadySignUp')
        }}</router-link>
      </div>
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
  .not-already-sign-in > * {
    text-decoration: none;
    color: black;
  }
}
</style>
