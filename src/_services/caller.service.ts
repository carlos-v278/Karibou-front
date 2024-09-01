import axios from 'axios';
import qs from 'qs';
import { accountService } from 'src/_services/account.service';
import { environments } from 'src/environements';


const Axios = axios.create({
  baseURL: environments.prod,
  paramsSerializer: (params) => qs.stringify(params),
});

Axios.interceptors.request.use((request) => {
  const token: string = accountService.getToken();
  if (token != '') {
    request.headers.Authorization = 'Bearer ' + token;
  }
  request.headers.Accept = 'application/json';
  request.headers['Content-Type'] = 'application/json';
  if (request.method === 'patch') {
    request.headers['Content-Type'] = 'application/merge-patch+json';
    request.headers.Accept = '*/*';
  }
  return request;
});
Axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response.status === 401) {
      console.log('inside  error', error.request);
      await accountService.logout();
      window.location.reload();
    }
    return error;
  }
);

export default Axios;
