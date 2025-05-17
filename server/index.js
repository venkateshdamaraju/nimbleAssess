import express from 'express';
import { createServer } from 'http';
import { Worker } from 'worker_threads';
import { handleWebRTC } from './webrtcHandler.js';
import { setupWebTransport } from './transportHandler.js';

const app = express();
const server = createServer(app);
const port = 3000;

app.use(express.static('../client'));

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// WebTransport handler setup (uses QUIC/HTTP3 in real prod)
setupWebTransport(server, handleWebRTC);
