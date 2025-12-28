// Music Player for Disney Monopoly background music
import { shuffleArray } from '../utils/helpers.js';

const PLAYLIST = [
    { file: 'audio/instrumental1.mp3', title: 'Aventura Magica' },
    { file: 'audio/instrumental2.mp3', title: 'Castell Encantat' },
    { file: 'audio/instrumental3.mp3', title: 'Somnis Disney' },
    { file: 'audio/instrumental4.mp3', title: 'Mon de Fantasia' },
    { file: 'audio/amblletra1.mp3', title: 'Canco Disney 1' },
    { file: 'audio/amblletra2.mp3', title: 'Canco Disney 2' },
    { file: 'audio/amblletra3.mp3', title: 'Canco Disney 3' },
    { file: 'audio/amblletra4.mp3', title: 'Canco Disney 4' },
];

class MusicPlayer {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.currentTrackIndex = 0;
        this.volume = 0.5;
        this.shuffledPlaylist = [];
        this.onTrackChange = null;
    }

    init() {
        if (!this.audio) {
            this.audio = new Audio();
            this.audio.volume = this.volume;
            this.audio.addEventListener('ended', () => this.playNext());
            this.shuffledPlaylist = shuffleArray(PLAYLIST);
        }
    }

    loadCurrentTrack() {
        if (this.shuffledPlaylist.length === 0) return false;
        this.audio.src = this.shuffledPlaylist[this.currentTrackIndex].file;
        this.notifyTrackChange();
        return true;
    }

    notifyTrackChange() {
        if (this.onTrackChange && this.shuffledPlaylist.length > 0) {
            this.onTrackChange(this.shuffledPlaylist[this.currentTrackIndex].title);
        }
    }

    getCurrentTrackTitle() {
        if (this.shuffledPlaylist.length === 0) return '';
        return this.shuffledPlaylist[this.currentTrackIndex].title;
    }

    async play() {
        this.init();

        if (!this.audio.src || this.audio.src === location.href) {
            if (!this.loadCurrentTrack()) {
                throw new Error('No tracks available');
            }
        }

        try {
            await this.audio.play();
            this.isPlaying = true;
            return true;
        } catch (err) {
            console.error('Failed to play music:', err);
            throw err;
        }
    }

    pause() {
        if (this.audio) {
            this.audio.pause();
            this.isPlaying = false;
        }
    }

    toggle() {
        if (this.isPlaying) {
            this.pause();
            return false;
        } else {
            return this.play().then(() => true);
        }
    }

    playNext() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.shuffledPlaylist.length;
        this.loadCurrentTrack();
        if (this.isPlaying) {
            this.audio.play();
        }
    }

    playPrevious() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.shuffledPlaylist.length) % this.shuffledPlaylist.length;
        this.loadCurrentTrack();
        if (this.isPlaying) {
            this.audio.play();
        }
    }

    setVolume(value) {
        this.volume = value / 100;
        if (this.audio) {
            this.audio.volume = this.volume;
        }
    }

    getVolume() {
        return this.volume * 100;
    }
}

// Export singleton instance
export const musicPlayer = new MusicPlayer();
export default musicPlayer;
