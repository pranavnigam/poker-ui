import io from 'socket.io-client';

const socketInstance = io.connect('http://ec2-18-219-4-248.us-east-2.compute.amazonaws.com:8080', {
  withCredentials: true, //Setting it true will enable sending cookies to server
});

export default socketInstance;
