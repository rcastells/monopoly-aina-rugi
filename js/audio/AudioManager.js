// Audio Manager for procedural sound effects in Disney Monopoly

class AudioManager {
    constructor() {
        this.audioCtx = null;
    }

    init() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
    }

    ensureContext() {
        this.init();
        return this.audioCtx;
    }

    playDiceRoll() {
        const audioCtx = this.ensureContext();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        // Create realistic dice shaking/tumbling sounds
        const hitCount = 12;
        for (let i = 0; i < hitCount; i++) {
            const delay = i * 0.06 + Math.random() * 0.02;
            const volume = 0.15 * (1 - i / hitCount * 0.5);

            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            osc1.frequency.value = 800 + Math.random() * 600;
            osc2.frequency.value = 1200 + Math.random() * 800;
            osc1.type = 'square';
            osc2.type = 'triangle';

            filter.type = 'highpass';
            filter.frequency.value = 500;
            filter.Q.value = 1;

            gain.gain.setValueAtTime(volume, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.03);

            osc1.start(now + delay);
            osc1.stop(now + delay + 0.03);
            osc2.start(now + delay);
            osc2.stop(now + delay + 0.03);
        }

        // Add a subtle shake/rattle undertone
        const noiseOsc = audioCtx.createOscillator();
        const noiseGain = audioCtx.createGain();
        const noiseFilter = audioCtx.createBiquadFilter();

        noiseOsc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);

        noiseOsc.type = 'sawtooth';
        noiseOsc.frequency.value = 100;
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 2000;
        noiseFilter.Q.value = 0.5;

        noiseGain.gain.setValueAtTime(0.08, now);
        noiseGain.gain.linearRampToValueAtTime(0.02, now + 0.5);
        noiseGain.gain.linearRampToValueAtTime(0, now + 0.7);

        noiseOsc.start(now);
        noiseOsc.stop(now + 0.7);
    }

    playDiceLand() {
        const audioCtx = this.ensureContext();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        // Two solid "thunk" sounds for dice landing
        for (let i = 0; i < 2; i++) {
            const delay = i * 0.08;

            const thump = audioCtx.createOscillator();
            const thumpGain = audioCtx.createGain();
            thump.connect(thumpGain);
            thumpGain.connect(audioCtx.destination);
            thump.frequency.setValueAtTime(180 - i * 20, now + delay);
            thump.frequency.exponentialRampToValueAtTime(60, now + delay + 0.1);
            thump.type = 'sine';
            thumpGain.gain.setValueAtTime(0.25, now + delay);
            thumpGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
            thump.start(now + delay);
            thump.stop(now + delay + 0.12);

            const click = audioCtx.createOscillator();
            const clickGain = audioCtx.createGain();
            const clickFilter = audioCtx.createBiquadFilter();
            click.connect(clickFilter);
            clickFilter.connect(clickGain);
            clickGain.connect(audioCtx.destination);
            click.frequency.value = 1500 + Math.random() * 500;
            click.type = 'square';
            clickFilter.type = 'highpass';
            clickFilter.frequency.value = 1000;
            clickGain.gain.setValueAtTime(0.1, now + delay);
            clickGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.02);
            click.start(now + delay);
            click.stop(now + delay + 0.02);
        }

        // Pleasant success chime
        setTimeout(() => {
            if (!this.audioCtx) return;
            const notes = [659.25, 783.99];
            notes.forEach((freq, i) => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                const t = this.audioCtx.currentTime + i * 0.08;
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.25);
                osc.start(t);
                osc.stop(t + 0.25);
            });
        }, 200);
    }

    playCollectMoney() {
        const audioCtx = this.ensureContext();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99];

        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.15, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.2);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.2);
        });
    }

    playPayMoney() {
        const audioCtx = this.ensureContext();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;
        for (let i = 0; i < 4; i++) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            const baseFreq = 2000 + Math.random() * 1500;
            osc.frequency.setValueAtTime(baseFreq, now + i * 0.08);
            osc.frequency.exponentialRampToValueAtTime(800, now + i * 0.08 + 0.1);
            osc.type = 'square';

            filter.type = 'bandpass';
            filter.frequency.value = 3000;
            filter.Q.value = 2;

            gain.gain.setValueAtTime(0.12, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.12);

            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.15);
        }
    }

    playCard() {
        const audioCtx = this.ensureContext();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        // Card flip/swoosh sound
        for (let i = 0; i < 3; i++) {
            const swoosh = audioCtx.createOscillator();
            const swooshGain = audioCtx.createGain();
            const swooshFilter = audioCtx.createBiquadFilter();

            swoosh.connect(swooshFilter);
            swooshFilter.connect(swooshGain);
            swooshGain.connect(audioCtx.destination);

            swoosh.type = 'sawtooth';
            swoosh.frequency.setValueAtTime(100 + i * 50, now + i * 0.02);
            swoosh.frequency.exponentialRampToValueAtTime(2000, now + i * 0.02 + 0.08);

            swooshFilter.type = 'bandpass';
            swooshFilter.frequency.value = 1500;
            swooshFilter.Q.value = 1;

            swooshGain.gain.setValueAtTime(0.08, now + i * 0.02);
            swooshGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.02 + 0.1);

            swoosh.start(now + i * 0.02);
            swoosh.stop(now + i * 0.02 + 0.1);
        }

        // Magical sparkle chime
        setTimeout(() => {
            if (!this.audioCtx) return;
            const t = this.audioCtx.currentTime;
            const sparkleNotes = [1318.51, 1567.98, 2093.00];

            sparkleNotes.forEach((freq, i) => {
                const sparkle = this.audioCtx.createOscillator();
                const sparkleGain = this.audioCtx.createGain();

                sparkle.connect(sparkleGain);
                sparkleGain.connect(this.audioCtx.destination);

                sparkle.frequency.value = freq;
                sparkle.type = 'sine';

                sparkleGain.gain.setValueAtTime(0.1, t + i * 0.06);
                sparkleGain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.2);

                sparkle.start(t + i * 0.06);
                sparkle.stop(t + i * 0.06 + 0.2);
            });
        }, 100);
    }

    playBuyProperty() {
        const audioCtx = this.ensureContext();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        // Cash register "cha-ching" sound
        const bell = audioCtx.createOscillator();
        const bellGain = audioCtx.createGain();
        bell.connect(bellGain);
        bellGain.connect(audioCtx.destination);
        bell.frequency.value = 1200;
        bell.type = 'sine';
        bellGain.gain.setValueAtTime(0.2, now);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        bell.start(now);
        bell.stop(now + 0.3);

        // Success fanfare
        setTimeout(() => {
            if (!this.audioCtx) return;
            const t = this.audioCtx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.50];

            notes.forEach((freq, i) => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.12, t + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.25);
                osc.start(t + i * 0.08);
                osc.stop(t + i * 0.08 + 0.25);
            });
        }, 150);
    }

    playPassGo() {
        const audioCtx = this.ensureContext();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        // Triumphant fanfare
        const notes = [392.00, 493.88, 587.33, 783.99];
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.18, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
        });

        // Coin shower sound
        setTimeout(() => {
            if (!this.audioCtx) return;
            const t = this.audioCtx.currentTime;
            for (let i = 0; i < 8; i++) {
                const coin = this.audioCtx.createOscillator();
                const coinGain = this.audioCtx.createGain();
                const coinFilter = this.audioCtx.createBiquadFilter();

                coin.connect(coinFilter);
                coinFilter.connect(coinGain);
                coinGain.connect(this.audioCtx.destination);

                coin.frequency.value = 2500 + Math.random() * 1500;
                coin.type = 'square';
                coinFilter.type = 'bandpass';
                coinFilter.frequency.value = 3500;
                coinFilter.Q.value = 3;

                const delay = i * 0.04 + Math.random() * 0.02;
                coinGain.gain.setValueAtTime(0.08, t + delay);
                coinGain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.08);

                coin.start(t + delay);
                coin.stop(t + delay + 0.1);
            }
        }, 300);
    }

    playBuildHouse() {
        const audioCtx = this.ensureContext();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        // Hammer hits
        for (let i = 0; i < 3; i++) {
            const hammer = audioCtx.createOscillator();
            const hammerGain = audioCtx.createGain();
            const hammerFilter = audioCtx.createBiquadFilter();

            hammer.connect(hammerFilter);
            hammerFilter.connect(hammerGain);
            hammerGain.connect(audioCtx.destination);

            hammer.frequency.value = 150 + Math.random() * 50;
            hammer.type = 'square';
            hammerFilter.type = 'lowpass';
            hammerFilter.frequency.value = 400;

            const delay = i * 0.15;
            hammerGain.gain.setValueAtTime(0.2, now + delay);
            hammerGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

            hammer.start(now + delay);
            hammer.stop(now + delay + 0.1);
        }

        // Construction complete chime
        setTimeout(() => {
            if (!this.audioCtx) return;
            const t = this.audioCtx.currentTime;
            const notes = [523.25, 659.25, 783.99];

            notes.forEach((freq, i) => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.12, t + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.2);
                osc.start(t + i * 0.08);
                osc.stop(t + i * 0.08 + 0.2);
            });
        }, 450);
    }

    playCollectRent() {
        const audioCtx = this.ensureContext();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        // Cash register drawer opening
        const drawer = audioCtx.createOscillator();
        const drawerGain = audioCtx.createGain();
        drawer.connect(drawerGain);
        drawerGain.connect(audioCtx.destination);
        drawer.frequency.setValueAtTime(200, now);
        drawer.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        drawer.type = 'sine';
        drawerGain.gain.setValueAtTime(0.15, now);
        drawerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        drawer.start(now);
        drawer.stop(now + 0.1);

        // Ka-ching bell
        setTimeout(() => {
            if (!this.audioCtx) return;
            const t = this.audioCtx.currentTime;

            const bell = this.audioCtx.createOscillator();
            const bellGain = this.audioCtx.createGain();
            bell.connect(bellGain);
            bellGain.connect(this.audioCtx.destination);
            bell.frequency.value = 2000;
            bell.type = 'sine';
            bellGain.gain.setValueAtTime(0.2, t);
            bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            bell.start(t);
            bell.stop(t + 0.4);
        }, 80);
    }

    playBankruptcy() {
        const audioCtx = this.ensureContext();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        // Dramatic descending notes
        const doomNotes = [440, 370, 311, 261, 220, 185];
        doomNotes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            osc.frequency.value = freq;
            osc.type = 'sawtooth';
            filter.type = 'lowpass';
            filter.frequency.value = 800;

            const delay = i * 0.2;
            gain.gain.setValueAtTime(0.15, now + delay);
            gain.gain.linearRampToValueAtTime(0.08, now + delay + 0.15);
            gain.gain.linearRampToValueAtTime(0, now + delay + 0.2);

            osc.start(now + delay);
            osc.stop(now + delay + 0.2);
        });

        // Low rumble
        const rumble = audioCtx.createOscillator();
        const rumbleGain = audioCtx.createGain();
        rumble.connect(rumbleGain);
        rumbleGain.connect(audioCtx.destination);
        rumble.frequency.value = 50;
        rumble.type = 'sine';
        rumbleGain.gain.setValueAtTime(0.2, now);
        rumbleGain.gain.linearRampToValueAtTime(0.3, now + 0.5);
        rumbleGain.gain.linearRampToValueAtTime(0, now + 1.2);
        rumble.start(now);
        rumble.stop(now + 1.2);
    }

    playJail() {
        const audioCtx = this.ensureContext();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        // Prison door slam
        const slam = audioCtx.createOscillator();
        const slamGain = audioCtx.createGain();
        const slamFilter = audioCtx.createBiquadFilter();

        slam.connect(slamFilter);
        slamFilter.connect(slamGain);
        slamGain.connect(audioCtx.destination);

        slam.frequency.value = 80;
        slam.type = 'square';
        slamFilter.type = 'lowpass';
        slamFilter.frequency.value = 200;

        slamGain.gain.setValueAtTime(0.3, now);
        slamGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        slam.start(now);
        slam.stop(now + 0.2);

        // Metal clang
        const clang = audioCtx.createOscillator();
        const clangGain = audioCtx.createGain();
        clang.connect(clangGain);
        clangGain.connect(audioCtx.destination);
        clang.frequency.value = 400;
        clang.type = 'triangle';
        clangGain.gain.setValueAtTime(0.2, now + 0.05);
        clangGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        clang.start(now + 0.05);
        clang.stop(now + 0.4);

        // Ominous notes
        setTimeout(() => {
            if (!this.audioCtx) return;
            const t = this.audioCtx.currentTime;
            const notes = [293.66, 277.18, 261.63, 220];
            notes.forEach((freq, i) => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                const filter = this.audioCtx.createBiquadFilter();

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.audioCtx.destination);

                osc.frequency.value = freq;
                osc.type = 'sawtooth';
                filter.type = 'lowpass';
                filter.frequency.value = 1000;

                gain.gain.setValueAtTime(0.12, t + i * 0.22);
                gain.gain.linearRampToValueAtTime(0, t + i * 0.22 + 0.28);

                osc.start(t + i * 0.22);
                osc.stop(t + i * 0.22 + 0.28);
            });
        }, 350);
    }

    playVictory() {
        const audioCtx = this.ensureContext();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        // Victory fanfare
        const fanfareNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        fanfareNotes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.2, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.4);
        });
    }
}

// Export singleton instance
export const audioManager = new AudioManager();
export default audioManager;
