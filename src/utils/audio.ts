export const playClick = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();
  
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  };
  
  export const playShake = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();
  
      const duration = 0.5; // seconds
      const bufferSize = audioCtx.sampleRate * duration;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
  
      for (let i = 0; i < bufferSize; i++) {
        const noise = Math.random() * 2 - 1;
        const time = i / audioCtx.sampleRate;
        // Moderate fast shakes
        const shakeEnv = Math.sin(time * Math.PI * 18);
        data[i] = noise * Math.max(0, shakeEnv) * 2; // boost noise a bit
      }
  
      const noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = buffer;
  
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800; // sound somewhat muffled
      filter.Q.value = 1.0;
  
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.6, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  
      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
  
      noiseSource.start();
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  };
  
