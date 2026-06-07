export class WebRTCManager {
  constructor(socket, onMessageCallback, onStatusChange) {
    this.socket = socket;
    this.onMessageCallback = onMessageCallback;
    this.onStatusChange = onStatusChange;
    this.peerConnection = null;
    this.dataChannel = null;
    this.peerId = null;
    
    // Bind socket listeners for signaling
    this.socket.on('webrtc-offer', this.handleOffer);
    this.socket.on('webrtc-answer', this.handleAnswer);
    this.socket.on('webrtc-ice-candidate', this.handleIceCandidate);
  }

  cleanup() {
    this.socket.off('webrtc-offer', this.handleOffer);
    this.socket.off('webrtc-answer', this.handleAnswer);
    this.socket.off('webrtc-ice-candidate', this.handleIceCandidate);
    
    if (this.dataChannel) {
      this.dataChannel.close();
    }
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    this.onStatusChange('disconnected');
  }

  initiateConnection(peerId) {
    this.peerId = peerId;
    this.createPeerConnection(peerId);
    
    this.dataChannel = this.peerConnection.createDataChannel('hush-chat');
    this.setupDataChannel(this.dataChannel);

    this.peerConnection.createOffer()
      .then(offer => this.peerConnection.setLocalDescription(offer))
      .then(() => {
        this.socket.emit('webrtc-offer', { offer: this.peerConnection.localDescription, to: peerId });
      })
      .catch(e => console.error('Error creating offer', e));
  }

  createPeerConnection(peerId) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('webrtc-ice-candidate', { candidate: event.candidate, to: peerId });
      }
    };

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel(this.dataChannel);
    };

    this.peerConnection.onconnectionstatechange = () => {
      this.onStatusChange(this.peerConnection.connectionState);
    };
  }

  setupDataChannel(channel) {
    channel.onopen = () => {
      console.log('WebRTC Data Channel Open');
      this.onStatusChange('connected');
    };
    channel.onclose = () => {
      console.log('WebRTC Data Channel Closed');
      this.onStatusChange('disconnected');
    };
    channel.onmessage = (event) => {
      this.onMessageCallback(event.data);
    };
  }

  sendMessage(messageStr) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(messageStr);
      return true;
    }
    return false;
  }

  handleOffer = async ({ offer, from }) => {
    this.peerId = from;
    this.createPeerConnection(from);
    
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    
    this.socket.emit('webrtc-answer', { answer, to: from });
  };

  handleAnswer = async ({ answer }) => {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  handleIceCandidate = async ({ candidate }) => {
    if (this.peerConnection) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error adding ice candidate', e);
      }
    }
  };
}
