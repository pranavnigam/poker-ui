import axios from 'axios';

const instance = axios.create({
  withCredentials: true, //Setting it true will enable sending cookies to server
});

export default instance;