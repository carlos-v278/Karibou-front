import Axios from './caller.service'


const newConversation = async (userIds:number ):Promise<any> =>{
  return await Axios.post('/api/conversations', userIds)
}

const getAllConversations =async():Promise<any> =>{
  return await Axios.get('/api/conversations');
}

const getOneConversation =async (conversationId: number):Promise<any> =>{
  return await Axios.get(`/api/conversations/${conversationId}`);
}

export const messagingService: {
  getAllConversations: () => Promise<any>;
  newConversation: (userIds: number) => Promise<any>;
  getOneConversation: (userIds:number) => Promise<any>;

} ={
  getAllConversations,
  newConversation,
  getOneConversation,
}
