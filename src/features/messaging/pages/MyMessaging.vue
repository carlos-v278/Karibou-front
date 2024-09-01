<script setup lang="ts">
import MyAvatarOptions from 'src/features/_base-components/MyAvatarOptions.vue';
import { nextTick, onMounted, reactive, ref } from 'vue';
import FormComponents from 'src/features/_base-components/FormComponents.vue';
import PropertyDetails from 'src/features/_base-components/PropertyDetails.vue';
import { useStoreBaseFeatures } from 'stores/base-features';
import {  messagingService, } from 'src/_services';
import {  Conversation } from 'src/utils/interfaces';
import ChatMessage from 'src/features/messaging/components/ChatMessage.vue';
import { useUserStore } from 'src/features/_utils/user.store';
import { storeToRefs } from 'pinia';
import ListItems from 'src/features/_base-components/listItems.vue';
import ToggleBtn from 'src/features/_base-components/ToggleBtn.vue';
import MyAvatar from 'src/features/_base-components/MyAvatar.vue';
import ListItem from 'src/features/_base-components/ListItem.vue';
import {MesageTypeChoice} from 'src/features/messaging/utils/messageTypeChoice';
import { useRoute } from 'vue-router';
import { date } from 'quasar'

const userStore = useUserStore();
const route = useRoute();

onMounted(async () => {
  await loadAllconversations();
  loadConversationFromRoute()
});
const { getUserProfile } = storeToRefs(userStore);

const slide = ref(1);

//current choice for the toggle of building or apartments
const currentChoice = ref(MesageTypeChoice.messages);

//function get emits from switch components
function getCurrentChoice(choice: MesageTypeChoice): void {
  currentChoice.value = choice;
}
const displayForm = ref(false);
const componentToDisplay = ref('none');

function getCurrFormToDisplay(choice: string): void {
  componentToDisplay.value = choice;
  displayForm.value = true;
}

function closeFormComponent() {
  componentToDisplay.value = 'none';
  displayForm.value = false;
}

let conversationsList = ref<Conversation[]>([]);
async function loadAllconversations() {
  useStoreBaseFeatures().enableLoading();
  await messagingService
    .getAllConversations()
    .then((res) => {
      console.log(res);
      conversationsList.value = res?.data;
      conversationsList.value.forEach((conversation) => {
        conversation.participants?.forEach((participant) => {
          if (participant.id !== getUserProfile.value?.id) {
            conversation.receiver = participant;
          }
        });
      });
      useStoreBaseFeatures().disableLoading();
    })
    .catch((res) => {
      console.log(res.status);
      useStoreBaseFeatures().disableLoading();
    });
}

const renderMessage = ref(false);
const currentConversation = ref<Conversation>();
function conversationSelected(conversation: Conversation): void {
  currentConversation.value = conversation;
  renderMessage.value = true;
  getCurrFormToDisplay('message');
}
function loadConversationFromRoute(){
  if(route.params.id){
    const routeConversationId: string = route.params.id as string
    const conversationIndex = conversationsList.value.findIndex((conversation)=> conversation.id === parseInt(routeConversationId, 10))
    conversationSelected(conversationsList.value[conversationIndex])
  }
}
async function reRenderFunc() {
  renderMessage.value = false;
  await nextTick();
  renderMessage.value = true;
}
</script>

<template>
  <q-page class="messaging row justify-center">
    <div class="left" :class="{ left_mobile_form: displayForm }">
      <div class="left_header">
        <MyAvatarOptions class="avatar" @display-form="getCurrFormToDisplay">
        </MyAvatarOptions>
      </div>
      <PropertyDetails
        class="header_banner"
        icon="fa-solid fa-bullhorn"
        component-title="messagePageTitle"
        type="messagePageSubline"
      >
        <template #actions>
          <q-icon
            name="fa-solid fa-arrows-rotate"
            round
            size="sm"
            color="primary"
            class="cursor-pointer"
            @click="loadAllconversations()"
          />
        </template>
      </PropertyDetails>
      <ToggleBtn
        :one-txt="MesageTypeChoice.messages"
        :two-txt="MesageTypeChoice.groups"
        @current-choice="getCurrentChoice"
      >
      </ToggleBtn>
      <div class="list-items">
        <ListItems
          v-if="currentChoice === MesageTypeChoice.messages"
          :list-items="conversationsList"
        >
          <template #item="item">
            <ListItem>
              <template #icons>
                <div class="icon row items-center justify-center">
                  <my-avatar :picture="item.recipient?.picture"></my-avatar>
                </div>
              </template>
              <template #infos>
                <div class="flex column justify-between">
                  <span
                  class="item-title flex row justify-between"
                >
                  <span class="contact-name">{{ item.receiver?.firstname }} {{ item.receiver?.lastname }} </span>
                </span>
                <span
                  class="item-message"
                >
                  {{item.lastMessage ? item.lastMessage.content : ''}}
                </span>
                </div>
              </template>
              <template v-slot:actions>
                <q-btn
                  round
                  unelevated
                  color="white"
                  size="sm"
                  text-color="primary"
                  icon="fa-solid fa-message"
                  @click="conversationSelected(item)"
                />
              </template>
              <template v-slot:light-info>
                <span class="last-message-time">{{item.lastMessage ? date.formatDate(item.lastMessage.createdAt, 'HH:mm') : ''}}</span>
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
          componentToDisplay === 'add-conversation' ||
          componentToDisplay === 'tenant-inv'
        "
        @close-form="closeFormComponent()"
        :component="componentToDisplay"
      ></FormComponents>
      <ChatMessage
        v-if="componentToDisplay === 'message' && renderMessage === true"
        :conversation="currentConversation"
        @close-form="closeFormComponent()"
        @re-render="reRenderFunc()"
      >
      </ChatMessage>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.messaging {
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
      max-width: 678px;
      margin: 30px auto;
    }
    .list-items {
      max-width: 478px;
      width: 100%;
      margin: 0 auto;
      
      .icon{
        scale: .85;
      }
      .item-message {
        display: block;
        max-width: 220px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        font-size: clamp(.5rem,3vw, .8rem);
        font-weight: 300;
      
      }
      .last-message-time{
        font-size: .8rem;
      }
    }
    .left_header {
      max-width: 578px;
      width: 100%;
      margin: 15px auto 45px;
      display: flex;
      justify-content: space-between;

      @media screen and (min-width: 977px) {
        margin: 5px auto 45px;
      }
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
  .messaging {
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
