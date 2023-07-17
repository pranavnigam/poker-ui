import io from 'socket.io-client';

const socketInstance = io.connect('http://localhost:8080', {
  withCredentials: true, //Setting it true will enable sending cookies to server
});

export default socketInstance;
