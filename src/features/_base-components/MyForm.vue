<script lang="ts" setup>
import Axios from 'src/_services/caller.service';
import { PropType, ref } from 'vue';
import { accountService, userService } from 'src/_services';
import { useUserStore } from 'src/features/_utils/user.store';
import { storeToRefs } from 'pinia';
import { notify } from 'src/utils/utils';
import { useStoreBaseFeatures } from 'stores/base-features';
import { useI18n } from 'vue-i18n';

const userInfosStore = useUserStore();
const { t } = useI18n();

const baselineSignInSuccess = ref(t('baselineSignInSuccess'));
const baselineSignInError = ref(t('baselineSignInError'));

const userData = useUserStore();
//all user data ex: profile and current role
const { getUserProfile } = storeToRefs(userData);
//props
const props = defineProps({
  formData: {
    type: Object,
  },
  request: {
    type: Object,
  },
  formImage: {
    type: Object as PropType<Blob | MediaSource>,
  },
});

const emits = defineEmits(['request-succeed']);
//submit form value
async function onSubmit() {
  await editMainInformations();
  filesUploads();
}

//function wich path every primitive users informations
async function editMainInformations(): Promise<void> {
  const dataBody = props.formData;

  if (props.request && props.request.method === 'patch') {
    if (
      dataBody?.firstname ||
      dataBody?.lastname ||
      dataBody?.password ||
      dataBody?.username
    ) {
      useStoreBaseFeatures().enableLoading();

      try {
        const res = await Axios.patch(props.request.url, dataBody);
        if (res.status === 201) {
          emits('request-succeed', true);
          notify(baselineSignInSuccess.value, 'positive');
        } else {
          notify(baselineSignInError.value, 'negative');
        }
      } catch (err) {}
      useStoreBaseFeatures().disableLoading();
    }
  }

  if (props.request && props.request.method === 'post' && dataBody) {
    useStoreBaseFeatures().enableLoading();

    try {
      const res = await Axios.post(props.request.url, dataBody);
      if (res.status === 201) {
        emits('request-succeed', true);
        notify(baselineSignInSuccess.value, 'positive');
      } else {
        notify(baselineSignInError.value, 'negative');
      }
    } catch (err) {
      console.error(err);
    }
    useStoreBaseFeatures().disableLoading();
  }
}

//function wich uploads files ex: user profile picture
function filesUploads(): void {
  if (props.formImage && Object.keys(props.formImage).length > 0) {
    let formData = new FormData();
    let myHeaders = new Headers();
    let token = accountService.getToken();
    myHeaders.append('Authorization', `Bearer ${token}`);
    formData.append('file', props.formImage);
    useStoreBaseFeatures().enableLoading();
    fetch(
      `${environments.prod}/api/users/${getUserProfile.value?.id}/picture`,
      {
        method: 'POST',
        headers: myHeaders,
        body: formData,
      }
    )
      .then(() => {
        notify('La photo a été uploadé avec succès.', 'positive');
        updateProfileInfos();
        useStoreBaseFeatures().disableLoading();
      })
      .catch(function (error) {
        useStoreBaseFeatures().disableLoading();
        console.log(error);
      });
  }
}

//update personal profile informations after edit
function updateProfileInfos() {
  userService.getUserProfile().then((res: unknown) => {
    userService.saveUserProfile(res.data);
    userInfosStore.updateUserProfile(res.data);
  });
}
</script>

<template>
  <div class="perso-infos-form">
    <q-form class="form" @submit="onSubmit">
      <div class="rows row-header">
        <slot name="header"> </slot>
      </div>
      <div class="rows row-main">
        <slot name="main"> </slot>
      </div>
      <div class="rows row-footer">
        <slot name="footer"> </slot>
      </div>
    </q-form>
  </div>
</template>

<style scoped lang="scss">
.perso-infos-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .form {
    padding: 15px 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    width: 100%;
    .rows {
      width: 100%;
      gap: 10px;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
