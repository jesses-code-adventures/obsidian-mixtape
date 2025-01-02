import ObsidianMixtapePlayer from 'player';

export default class ObsidianMixtapeProgressBar {
	player: ObsidianMixtapePlayer
	container: HTMLDivElement
	bar: HTMLInputElement

	constructor(player: ObsidianMixtapePlayer) {
		this.player = player
	}

	private registerListeners() {
		this.bar.addEventListener('input', () => {
			const track = this.player.getSelectedTrack();
			if (!track) {
				return
			}
			const fraction = Number(this.bar.value) / 100;
			if (track.audio.duration && !Number.isNaN(track.audio.duration)) {
				track.audio.currentTime = fraction * track.audio.duration;
			}
		});
	}

	render() {
		this.container = this.player.container.createDiv({
			cls: 'mixtape-progress-bar-container',
		});
		this.bar = this.container.createEl('input', {
			cls: 'mixtape-progress-bar',
			type: 'range',
			value: '0',
		});
		this.registerListeners();
	}
}
