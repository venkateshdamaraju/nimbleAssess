import wrtc from 'wrtc';

const { RTCPeerConnection, RTCVideoSource, RTCVideoFrame } = wrtc;

export const handleWebRTC = async (sdpOffer) => {
  const pc = new RTCPeerConnection();
  const videoSource = new RTCVideoSource();
  const track = videoSource.createTrack();
  pc.addTrack(track);

  await pc.setRemoteDescription({ type: 'offer', sdp: sdpOffer });
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  // Store `videoSource` to push frames later from worker
  return { answer: pc.localDescription.sdp, videoSource };
};
