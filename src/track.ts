import ObsidianMixtapePlayer from 'player';

export default class ObsidianMixtapeTrack {
	/** the audio element that the user can interact with to play/pause/scrub a track directly */
	audio: HTMLAudioElement
	/** the text to be displayed for the track in the mixtape playlist */
	text: string
	/** the (possibly relative) path specified by the user in Obsidian. */
	linkPath: string
	/** the full path to the track file defined by this plugin. */
	fullPath: string
	/** the player containing the track */
	player: ObsidianMixtapePlayer

	constructor(player: ObsidianMixtapePlayer, text: string, linkPath: string, fullPath: string) {
		this.player = player
		this.linkPath = linkPath
		this.fullPath = fullPath
		this.text = text
	}

	render() {
		this.player.container.createDiv({ text: this.text || this.linkPath });
		this.audio = this.player.container.createEl('audio', {
			attr: { src: this.fullPath, controls: '' },
		});
		// TODO: actually make this css class - currently non existent
		this.audio.addClass('mixtape-track');
		this.audio.setText(this.text);
		this.registerListeners();
	}

	private registerListeners() {
		this.audio.addEventListener('play', () => {
			let idx = -1;
			for (const [i, track] of this.player.getTracks().entries()) {
				if (track.audio === this.audio) {
					idx = i
				} else {
					this.player.controls.pauseTrack(track);
					track.audio.currentTime = 0;
				}
			}
			this.player.setSelectedTrack(idx);
			this.player.controls.updatePlayPauseText();
		});

		this.audio.addEventListener('pause', () => {
			const selected = this.player.getSelectedTrack();
			if (!selected || selected.audio !== this.audio) {
				return;
			}
			this.player.controls.updatePlayPauseText();
		});

		this.audio.addEventListener('timeupdate', () => {
			const track = this.player.getSelectedTrack();
			if (!track || this.audio !== track.audio) {
				return
			}
			const duration = this.audio.duration || 0;
			const current = this.audio.currentTime || 0;
			if (duration > 0) {
				const fraction = (current / duration) * 100;
				this.player.progressBar.bar.value = fraction.toFixed(2);
			} else {
				this.player.progressBar.bar.value = '0';
			}
		});

		this.audio.addEventListener('loadedmetadata', () => {
			const track = this.player.getSelectedTrack();
			if (!track || this.audio !== track.audio) {
				return
			}
			this.player.progressBar.bar.value = '0';
		});

		this.audio.addEventListener('ended', () => {
			const track = this.player.getSelectedTrack();
			if (!track || this.audio !== track.audio) {
				return
			}
			this.player.controls.handleTrackEnded();
		});
	}
}
