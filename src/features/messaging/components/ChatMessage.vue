<script setup lang="ts">
import { PropType, ref, watch,onMounted, onBeforeMount } from 'vue';
import { Conversation, Message, UserMessage, UserProfile, MessageApi } from 'src/utils/interfaces';
import MyAvatar from 'src/features/_base-components/MyAvatar.vue';
const emits = defineEmits(['closeForm', 'reRender']);
import { useUserStore } from 'src/features/_utils/user.store';
import { storeToRefs } from 'pinia';
import { RolesUser } from 'src/utils/rolesUser.enum';
import { useStoreBaseFeatures } from 'src/stores/base-features';
import { messagingService } from 'src/_services';
import { date } from 'quasar'
import { environments } from 'src/environements';


const userStore = useUserStore();

let { getUserProfile } = storeToRefs(userStore);
const props = defineProps({
  conversation: {
    type: Object as PropType<Conversation>,
  },
});

let currentDateAndTime = ref(Date.now())

function dynamicActualDate(){
  setInterval(()=>{
    currentDateAndTime.value = Date.now()
  }, 10000)
}

onMounted(()=>{
  loadAllconversations();
})

onBeforeMount(()=>{
  dynamicActualDate();
})

//init the connexion to the backend server socket
let conn = new WebSocket(`${environments.prodwebsocket}?room=${props.conversation?.id}`);

//list all the messages from both users
const messages = ref<Message[]>([]);

//current user informations
const currentUserConnected = ref<UserMessage>({
  id: props.conversation?.id,
  user: getUserProfile.value,
  message: '',
  picture: getUserProfile.value?.picture,
  createdAt: currentDateAndTime.value
});

// method to open the socket tunel
conn.onopen = function () {
  console.info('Connection established successfully');
};

//method which load all the message sent to the socket
conn.onmessage = function (e) {
  let data = JSON.parse(e.data);
  pushMessage(data.id, data.user, data.message, data.picture);
};

conn.onerror = function (e) {
  alert('Error: something went wrong with the socket.');
  console.error(e);
};

//method whick help to push new message to all the messages with both
function pushMessage(
  id: number,
  user: UserProfile | null,
  message: string,
  avatar?: string,
  createdAt?:string | number,
) {
  const from = user?.firstname === getUserProfile.value?.firstname ? 'me' : user?.firstname;
  messages.value.push({ id: id, from , text: message, picture: avatar, createdAt: createdAt});
}

function sendMessage() {
  if (!currentUserConnected.value.message) {
    alert('Veuillez remplir le champ');
    return;
  }
  conn.send(JSON.stringify(currentUserConnected.value));
  pushMessage(
    currentUserConnected.value.id as number,
    currentUserConnected.value.user,
    currentUserConnected.value.message,
    currentUserConnected.value.picture,
    currentUserConnected.value.createdAt
  );
  currentUserConnected.value.message = '';
}

watch(props, () => {
  emits('reRender');
});


async function loadAllconversations() {

  useStoreBaseFeatures().enableLoading();
  await messagingService
    .getOneConversation(props.conversation?.id)
    .then((res) => {
      const conversationMessage = res?.data;
      if(conversationMessage.messages){
        conversationMessage.messages.forEach((message : MessageApi)=>{
          pushMessage(conversationMessage.id as number, message.owner, message.content, getUserProfile.value?.picture, message.createdAt)
        })
      }
      useStoreBaseFeatures().disableLoading();
    })
    .catch((res) => {
      useStoreBaseFeatures().disableLoading();
    });
}

function getDiffWithCurrentDate(messageDate?:string):string{
  if(messageDate){
    const formatedmessageDate = date.formatDate(messageDate, 'YYYY-MM-DDTHH:mm')
    const formatedcurrentDate = date.formatDate(currentDateAndTime.value, 'YYYY-MM-DDTHH:mm')
    const diff = date.getDateDiff(formatedcurrentDate, formatedmessageDate, 'minutes')

    if (diff < 60) {
      return `${diff} m`;
    }
    const diffInHours = Math.round(diff / 60);

    if (diffInHours < 24) {
      return `${diffInHours} h`;
    }

    const diffInDays = Math.round(diffInHours / 24);
    return `${diffInDays} j`;
  }
  return ''
}

</script>
<template>
  <div class="conversation">
    <div class="header">
      <q-btn
        size="sm"
        color="grey-light"
        text-color="black"
        class="btn-back"
        round
        icon="fa-solid fa-arrow-left"
        @click="emits('closeForm')"
      />
      <div class="recipient">
        <my-avatar
          :picture="props.conversation?.receiver?.picture"
        ></my-avatar>
        <div class="recipient-infos">
          <span class="name"
            >{{ props.conversation?.receiver?.firstname }}
            {{ props.conversation?.receiver?.lastname }}</span
          >
          <div class="roles">
            <span
              v-if="props.conversation?.receiver?.roles.includes(RolesUser.syndicate)"
              class="role"
            >
              {{ $t('buildingManagerPerson') }}
            </span>
            <span
              v-if="props.conversation?.receiver?.roles.includes( RolesUser.owner)"
              class="role"
            >
              {{ $t('owner') }}
            </span>
            <span
              v-if="props.conversation?.receiver?.roles.includes(RolesUser.tenant)"
              class="role"
            >
              {{ $t('tenant') }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="main">
      <div class="message_container">
        <q-chat-message
          v-for="(message, index) in messages"
          :key="index"
          :name="message.from"
          :text="[message.text]"
          :sent="message.from === 'me' ? true : false"
          :stamp="getDiffWithCurrentDate(message.createdAt)"
        >
          <template #avatar>
            <my-avatar class="avatar" :picture="message?.picture"> </my-avatar>
          </template>
        </q-chat-message>
      </div>
    </div>
    <div class="footer">
      <q-input
        rounded
        outlined
        color="primary"
        class="input"
        v-model="currentUserConnected.message"
        @keyup.enter="sendMessage()"
        dense
      >
        <template v-slot:append>
          <q-icon
            name="fa-solid fa-paper-plane"
            round
            size="xs"
            color="primary"
            @click="sendMessage()"
          />
        </template>
      </q-input>
    </div>
  </div>
</template>

<style scoped lang="scss">
.conversation {
  padding: 15px;
  position: relative;
  width: 100%;
  border-left: 2px solid $grey-light;
  .header {
    padding: 12px 0;
    display: flex;
    gap: 10px;
    align-items: center;
    width: 100%;
    .btn-back {
      width: 40px !important;
      height: 40px;
      z-index: 99;
      background-color: white;
    }
    .recipient {
      display: flex;
      gap: 15px;
      align-items: center;
      .recipient-infos {
        .name {
          font-size: var(--fs-500);
          font-weight: 500;
        }
        .role {
          font-size: var(--fs-300);
          font-weight: 300;
        }
      }
    }
  }

  .main {
    background: $grey-light;
    border-radius: 10px;
    min-height: 66dvh;
    .message_container {
      padding: 20px 10px;
      height: 60dvh;
      overflow-y:scroll;
      .avatar {
        scale: .8;
      }
    }
  }
  .footer {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    
    .input {
      width: 100%;
    }
  }
}
@media screen and (min-width: 977px) {
  .conversation {
    width: 100%;
  }
}
</style>
