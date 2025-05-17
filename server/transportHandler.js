import { WebSocketServer } from 'ws';
import { Worker } from 'worker_threads';

let clientSocket = null;
let currentFrame = null;
let actualCoords = { x: 0, y: 0 };
let sendAnswerCallback = null;

/**
 * Setup WebSocket-based mock transport to simulate WebTransport behavior
 */
export function setupWebTransport(server, onSDPOfferReceived) {
  const wss = new WebSocketServer({ server, path: '/transport' });

  wss.on('connection', (ws) => {
    console.log('Client connected via WebTransport (simulated with WebSocket)');
    clientSocket = ws;

    ws.on('message', async (message) => {
      try {
        const parsed = JSON.parse(message);

        if (parsed.type === 'sdp') {
          // Received SDP Offer
          const { answer, videoSource } = await onSDPOfferReceived(parsed.data);
          sendAnswerCallback = () => {
            ws.send(JSON.stringify({ type: 'sdp-answer', data: answer }));
          };
          startWorker(videoSource);
        } else if (parsed.type === 'coords') {
          // Received ball center from client
          const { x, y } = parsed.data;
          const error = Math.sqrt((x - actualCoords.x) ** 2 + (y - actualCoords.y) ** 2);
          ws.send(JSON.stringify({ type: 'error', data: error.toFixed(2) }));
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    });
  });
}

/**
 * Spawns a worker thread to generate ball frames and update actualCoords
 */
function startWorker(videoSource) {
  const worker = new Worker('./server/worker.js');

  worker.on('message', ({ frame, x, y }) => {
    actualCoords = { x, y };

    // Send the frame to WebRTC Video Source
    if (videoSource) {
      const now = Date.now();
      const videoFrame = {
        width: 640,
        height: 480,
        data: frame,
        timestamp: now * 1000,
      };
      try {
        videoSource.onFrame(videoFrame); // node-webrtc-compatible
      } catch (e) {
        console.error('Frame push error:', e.message);
      }
    }

    if (sendAnswerCallback) {
      sendAnswerCallback(); // send SDP answer once we have frames
      sendAnswerCallback = null;
    }
  });

  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });

  worker.on('exit', (code) => {
    console.log(`Worker exited with code ${code}`);
  });
}
