
(() => {
  'use strict';

  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const makeId = () => globalThis.crypto?.randomUUID?.() || `peer-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const toCode = text => {
    const bytes = enc.encode(text);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  };
  const fromCode = code => {
    const normalized = String(code || '').trim().replaceAll('-', '+').replaceAll('_', '/');
    const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4));
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return dec.decode(bytes);
  };

  class DorukCraftNet {
    constructor(options = {}) {
      this.id = makeId();
      this.name = String(options.name || 'Player').slice(0, 24);
      this.onPacket = typeof options.onPacket === 'function' ? options.onPacket : () => {};
      this.onStatus = typeof options.onStatus === 'function' ? options.onStatus : () => {};
      this.onConnected = typeof options.onConnected === 'function' ? options.onConnected : () => {};
      this.channel = null;
      this.peer = null;
      this.data = null;
      this.role = 'offline';
      this.room = '';
      this.large = new Map();
      this.connected = false;
      this.discovery = null;
      this.discoveryTimer = null;
      this.discoveryStopTimer = null;
      this.localHost = false;
    }

    status(text) {
      this.onStatus(String(text));
    }

    close() {
      try { this.channel?.close(); } catch {}
      try { this.data?.close(); } catch {}
      try { this.peer?.close(); } catch {}
      try { this.discovery?.close(); } catch {}
      if (this.discoveryTimer) clearInterval(this.discoveryTimer);
      if (this.discoveryStopTimer) clearTimeout(this.discoveryStopTimer);
      this.discoveryTimer = this.discoveryStopTimer = null;
      this.discovery = null;
      this.localHost = false;
      this.channel = null;
      this.data = null;
      this.peer = null;
      this.role = 'offline';
      this.room = '';
      this.connected = false;
      this.large.clear();
      this.status('Offline');
    }

    normalizeRoom(roomName) {
      return String(roomName || 'doruk').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 40) || 'doruk';
    }

    startLocal(roomName, role = 'local') {
      this.close();
      const room = this.normalizeRoom(roomName);
      if (!('BroadcastChannel' in globalThis)) throw new Error('Local rooms are not supported by this browser.');
      this.role = role === 'host' ? 'host' : role === 'guest' ? 'guest' : 'local';
      this.room = room;
      this.channel = new BroadcastChannel(`dorukcraft-v015-room-${room}`);
      this.channel.onmessage = event => this.receive(event.data);
      this.connected = true;
      this.status(this.role === 'host' ? `Hosting local game: ${room}` : this.role === 'guest' ? `Joined local game: ${room}` : `Local room: ${room}`);
      this.send('hello', { name: this.name, role: this.role, local: true });
      this.onConnected({ role: this.role, local: true, room });
      return room;
    }

    openDiscovery(onGame) {
      if (!('BroadcastChannel' in globalThis)) throw new Error('Local game scanning is not supported by this browser.');
      try { this.discovery?.close(); } catch {}
      this.discovery = new BroadcastChannel('dorukcraft-v015-discovery');
      this.discovery.onmessage = event => {
        const msg = event.data || {};
        if (msg.dcDiscovery !== 1 || msg.sender === this.id) return;
        if (msg.type === 'probe' && this.localHost && this.room) {
          this.advertiseLocalGame();
          return;
        }
        if (msg.type === 'host' && typeof onGame === 'function' && msg.room) {
          onGame({ room: this.normalizeRoom(msg.room), name: String(msg.name || 'DorukCraft World').slice(0, 48), host: String(msg.host || 'Player').slice(0, 24), sender: msg.sender, seenAt: Date.now() });
        }
      };
      return this.discovery;
    }

    advertiseLocalGame() {
      if (!this.discovery || !this.localHost || !this.room) return;
      this.discovery.postMessage({ dcDiscovery: 1, type: 'host', sender: this.id, room: this.room, name: this.localGameName || 'DorukCraft World', host: this.name, sentAt: Date.now() });
    }

    hostLocalGame(gameName = 'DorukCraft World') {
      const room = `dc-${Math.random().toString(36).slice(2, 8)}`;
      this.startLocal(room, 'host');
      this.localHost = true;
      this.localGameName = String(gameName || 'DorukCraft World').slice(0, 48);
      this.openDiscovery();
      this.advertiseLocalGame();
      this.discoveryTimer = setInterval(() => this.advertiseLocalGame(), 1200);
      this.status(`Hosting “${this.localGameName}” — nearby DorukCraft tabs can find it`);
      return room;
    }

    joinLocalGame(room) {
      return this.startLocal(room, 'guest');
    }

    scanLocalGames(onGame, duration = 4200) {
      this.close();
      this.role = 'scanning';
      const channel = this.openDiscovery(onGame);
      channel.postMessage({ dcDiscovery: 1, type: 'probe', sender: this.id, sentAt: Date.now() });
      this.status('Scanning for local DorukCraft games…');
      this.discoveryStopTimer = setTimeout(() => {
        if (this.role !== 'scanning') return;
        try { this.discovery?.close(); } catch {}
        this.discovery = null;
        this.discoveryStopTimer = null;
        this.role = 'offline';
        this.status('Local scan finished');
      }, Math.max(1200, Number(duration) || 4200));
    }

    makePeer() {
      if (!('RTCPeerConnection' in globalThis)) throw new Error('WebRTC is not available in this browser.');
      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      peer.onconnectionstatechange = () => {
        const state = peer.connectionState;
        if (state === 'connected') {
          this.connected = true;
          this.status(this.role === 'host' ? 'Connected as host' : 'Connected to host');
          this.onConnected({ role: this.role, local: false });
          this.send('hello', { name: this.name, role: this.role });
        } else if (['failed', 'closed', 'disconnected'].includes(state)) {
          this.connected = false;
          this.status(`Connection ${state}`);
        }
      };
      this.peer = peer;
      return peer;
    }

    bindData(channel) {
      this.data = channel;
      channel.binaryType = 'arraybuffer';
      channel.onopen = () => {
        this.connected = true;
        this.status(this.role === 'host' ? 'Connected as host' : 'Connected to host');
        this.onConnected({ role: this.role, local: false });
        this.send('hello', { name: this.name, role: this.role });
      };
      channel.onclose = () => {
        this.connected = false;
        this.status('Peer disconnected');
      };
      channel.onerror = () => this.status('Peer connection error');
      channel.onmessage = event => this.receive(event.data);
    }

    async waitForIce(peer, timeout = 6500) {
      if (peer.iceGatheringState === 'complete') return;
      await new Promise(resolve => {
        const timer = setTimeout(resolve, timeout);
        const done = () => {
          if (peer.iceGatheringState !== 'complete') return;
          clearTimeout(timer);
          peer.removeEventListener('icegatheringstatechange', done);
          resolve();
        };
        peer.addEventListener('icegatheringstatechange', done);
      });
    }

    async createHostOffer() {
      this.close();
      this.role = 'host';
      const peer = this.makePeer();
      this.bindData(peer.createDataChannel('dorukcraft', { ordered: true }));
      await peer.setLocalDescription(await peer.createOffer());
      this.status('Gathering connection details…');
      await this.waitForIce(peer);
      this.status('Offer ready — send it to the other player');
      return toCode(JSON.stringify(peer.localDescription));
    }

    async acceptOffer(offerCode) {
      this.close();
      this.role = 'guest';
      const peer = this.makePeer();
      peer.ondatachannel = event => this.bindData(event.channel);
      const offer = JSON.parse(fromCode(offerCode));
      if (offer?.type !== 'offer' || typeof offer.sdp !== 'string') throw new Error('That host code is invalid.');
      await peer.setRemoteDescription(offer);
      await peer.setLocalDescription(await peer.createAnswer());
      this.status('Gathering connection details…');
      await this.waitForIce(peer);
      this.status('Answer ready — send it back to the host');
      return toCode(JSON.stringify(peer.localDescription));
    }

    async acceptAnswer(answerCode) {
      if (this.role !== 'host' || !this.peer) throw new Error('Create a host offer first.');
      const answer = JSON.parse(fromCode(answerCode));
      if (answer?.type !== 'answer' || typeof answer.sdp !== 'string') throw new Error('That answer code is invalid.');
      await this.peer.setRemoteDescription(answer);
      this.status('Connecting…');
    }

    envelope(type, data) {
      return { dc: 1, sender: this.id, name: this.name, type, data, sentAt: Date.now() };
    }

    send(type, data) {
      const packet = this.envelope(type, data);
      const raw = JSON.stringify(packet);
      if (this.channel) this.channel.postMessage(raw);
      if (this.data?.readyState === 'open') this.data.send(raw);
    }

    sendLarge(type, data) {
      const raw = JSON.stringify(data);
      const transfer = makeId();
      const size = 12000;
      const count = Math.ceil(raw.length / size);
      for (let index = 0; index < count; index++) {
        this.send('__chunk', { transfer, type, index, count, value: raw.slice(index * size, (index + 1) * size) });
      }
    }

    receive(input) {
      let packet;
      try {
        if (input instanceof ArrayBuffer) input = dec.decode(new Uint8Array(input));
        packet = typeof input === 'string' ? JSON.parse(input) : input;
      } catch { return; }
      if (!packet || packet.dc !== 1 || packet.sender === this.id || typeof packet.type !== 'string') return;
      if (packet.type === '__chunk') {
        const part = packet.data || {};
        if (!part.transfer || !Number.isInteger(part.index) || !Number.isInteger(part.count) || part.count < 1 || part.count > 2048 || part.index < 0 || part.index >= part.count) return;
        let entry = this.large.get(part.transfer);
        if (!entry) {
          entry = { type: String(part.type || ''), chunks: Array(part.count), received: 0, sender: packet.sender, name: packet.name, time: Date.now() };
          this.large.set(part.transfer, entry);
        }
        if (entry.chunks.length !== part.count || entry.type !== part.type) return;
        if (entry.chunks[part.index] === undefined) entry.received++;
        entry.chunks[part.index] = String(part.value || '');
        if (entry.received === entry.chunks.length) {
          this.large.delete(part.transfer);
          try { this.onPacket({ ...packet, type: entry.type, data: JSON.parse(entry.chunks.join('')) }); } catch {}
        }
        for (const [key, old] of this.large) if (Date.now() - old.time > 30000) this.large.delete(key);
        return;
      }
      this.onPacket(packet);
    }
  }

  DorukCraftNet.encodeCode = toCode;
  DorukCraftNet.decodeCode = fromCode;
  globalThis.DorukCraftNet = DorukCraftNet;
})();

