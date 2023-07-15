import io from 'socket.io-client';

const socketInstance = io.connect('http://poker-service.azurewebsites.net', {
  withCredentials: true, //Setting it true will enable sending cookies to server
});

export default socketInstance;
