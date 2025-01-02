import ObsidianMixtapePlayer from "player";

export default class ObsidianMixtapeControls {
	container: HTMLDivElement;
	controlBar: HTMLDivElement;
	btnPrev: HTMLButtonElement;
	btnPlayPause: HTMLButtonElement;
	btnNext: HTMLButtonElement
	nowPlayingDisplay: HTMLDivElement;
	player: ObsidianMixtapePlayer

	constructor(player: ObsidianMixtapePlayer) {
		this.player = player;
	}

	render() {
		this.container = this.player.container.createDiv({
			cls: 'mixtape-controls-container',
		});
		this.controlBar = this.container.createDiv({
			cls: 'mixtape-controls',
		});
		this.btnPrev = this.controlBar.createEl('button', { text: '⏮️' });
		this.btnPlayPause = this.controlBar.createEl('button', { text: '▶️' });
		this.btnNext = this.controlBar.createEl('button', { text: '⏭️' });
		this.nowPlayingDisplay = this.player.container.createDiv({ cls: 'mixtape-now-playing' });
		this.nowPlayingDisplay.setText('');
		this.registerListeners();
	}

	private registerListeners() {
		this.btnPrev.addEventListener('click', () => {
			this.goToPrev();
		});
		this.btnPlayPause.addEventListener('click', () => {
			this.togglePlayback();
		});
		this.btnNext.addEventListener('click', () => {
			this.goToNext();
		});
	}

	/**
	 * Restarts the currently selected track and puts it in a paused state.
	 * If no track is selected, this method does nothing.
	 */
	restartSelectedTrack() {
		const track = this.player.getSelectedTrack();
		if (!track) {
			return
		}
		if (!track.audio.paused) {
			track.audio.pause()
		}
		track.audio.currentTime = 0;
	}

	updatePlayPauseText() {
		const track = this.player.getSelectedTrack();
		if (!track) {
			this.btnPlayPause.setText('⏸️');
			this.nowPlayingDisplay.setText('');
			return
		}
		const targetButtonText = track.audio.paused ? '▶️' : '⏸️' 
		const targetPlaybackStatus = track.audio.paused ? 'Paused' : 'Playing'
		this.btnPlayPause.setText(targetButtonText);
		this.nowPlayingDisplay.setText(`${targetPlaybackStatus}: ${track.audio.textContent}`);
	}

	pause() {
		const track = this.player.getSelectedTrack();
		if (track) {
			track.audio.pause();
			this.updatePlayPauseText();
		}
	}

	/** function to call externally, on events where playback of a track has ended */
	handleTrackEnded() {
		this.goToNext()
	}

	private goToNext() {
		// first, restart and pause the currently playing track if there is one
		this.restartSelectedTrack();
		// increment the selected track index
		let targetTrackIdx = this.player.selectedTrackIdx + 1
		if (targetTrackIdx >= this.player.tracks.length) {
			targetTrackIdx = 0	
		}
		this.player.setSelectedTrack(targetTrackIdx);
		this.play();
	}

	private goToPrev() {
		// if we're on the first track, loop back to the last track
		let targetTrackIdx = this.player.selectedTrackIdx - 1
		if (targetTrackIdx < 0) {
			targetTrackIdx = this.player.tracks.length - 1	
		}
		this.restartSelectedTrack();
		this.player.selectedTrackIdx = targetTrackIdx;
		this.play();
	}

	private togglePlayback() {
		const track = this.player.getSelectedTrack();
		if (!track) {
			return
		}
		if (track.audio.paused) {
			this.play();
		} else {
			this.pause();
		}
	}

	/** plays the currently selected track, if there is one */
	private play() {
		const track = this.player.getSelectedTrack()
		if (track) {
			track.audio.play();
			this.updatePlayPauseText();
			return
		}
	}
}
