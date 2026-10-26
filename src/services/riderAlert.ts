// Web Notifications API & Web Audio API Alert Service for KITNOVA Rider Dispatch

export class RiderAlertService {
  private static instance: RiderAlertService;
  private audioCtx: AudioContext | null = null;

  private constructor() {
    // Lazy initialize on first user interaction
  }

  static getInstance(): RiderAlertService {
    if (!RiderAlertService.instance) {
      RiderAlertService.instance = new RiderAlertService();
    }
    return RiderAlertService.instance;
  }

  private initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Synthesize a crisp, distinctive athletic chime/relay baton chime
   * using Web Audio API oscillators. Works everywhere without external audio files.
   */
  playDispatchChime(): void {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // Two-tone rising sports chime: Tone 1 (Gold 587.33Hz - D5) -> Tone 2 (880Hz - A5) -> Tone 3 (1174.66Hz - D6)
      const frequencies = [587.33, 880, 1174.66];
      frequencies.forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        // Soft attack & exponential decay
        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.36);
      });
    } catch (e) {
      console.warn('Audio chime playback error:', e);
    }
  }

  /**
   * Request browser Web Notifications permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Web Notifications API is not supported in this browser.');
      return 'denied';
    }
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return Notification.permission;
    }
  }

  /**
   * Trigger real-time browser notification + audio chime when a new delivery task is assigned
   */
  notifyNewTask(orderNumber: string, customerName: string, destination: string, onAction?: () => void): void {
    // 1. Play synthesized audio dispatch chime immediately
    this.playDispatchChime();

    // 2. Trigger browser notification if supported and granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification('🚨 New KITNOVA Delivery Task Assigned!', {
          body: `Order #${orderNumber} for ${customerName} to ${destination}. Tap to open route.`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `task-${orderNumber}`,
          requireInteraction: true
        });

        notif.onclick = () => {
          window.focus();
          if (onAction) onAction();
          notif.close();
        };
      } catch (err) {
        console.warn('Notification trigger error:', err);
      }
    }
  }
}

export const riderAlert = RiderAlertService.getInstance();
