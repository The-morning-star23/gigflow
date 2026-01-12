import { io } from 'socket.io-client';

// This connects to your backend server
const socket = io('http://localhost:5000', {
  withCredentials: true,
  autoConnect: true
});

export default socket;