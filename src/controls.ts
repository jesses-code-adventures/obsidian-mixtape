export default class ObsidianMixtapeControls {
	parentContainer: HTMLDivElement;
	container: HTMLDivElement;
	controlBar: HTMLDivElement;
	btnPrev: HTMLButtonElement;
	btnPlayPause: HTMLButtonElement;
	btnNext: HTMLButtonElement
	audioElements: HTMLAudioElement[];
	nowPlayingDisplay: HTMLDivElement;
	selectedTrackIdx: number;

	constructor(playerContainer: HTMLDivElement, audioElements: HTMLAudioElement[], selectedTrackIdx: number) {
		this.parentContainer = playerContainer;
		this.selectedTrackIdx = selectedTrackIdx;
		this.audioElements = audioElements;
		this.container = playerContainer.createDiv({
			cls: 'mixtape-controls-container',
		});
		this.controlBar = this.container.createDiv({
			cls: 'mixtape-controls',
		});
		this.btnPrev = this.controlBar.createEl('button', { text: '⏮️' });
		this.btnPlayPause = this.controlBar.createEl('button', { text: '▶️'  });
		this.btnNext = this.controlBar.createEl('button', { text: '⏭️' });
		this.nowPlayingDisplay = playerContainer.createDiv({ cls: 'mixtape-now-playing' });
		this.nowPlayingDisplay.setText('');
		this.registerListeners();
	}

	registerListeners() {
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
		const audio = this.audioElements[this.selectedTrackIdx];
		if (!audio) {
			return
		}
		if (!audio.paused) {
			audio.pause()
		}
		audio.currentTime = 0;
	}

	updatePlayPauseText() {
		const audio = this.audioElements[this.selectedTrackIdx];
		if (audio && !audio.paused) {
			this.btnPlayPause.setText('⏸️');
			this.nowPlayingDisplay.setText(`Playing: ${audio.textContent}`);
		} else if (audio) {
			this.btnPlayPause.setText('▶️');
			this.nowPlayingDisplay.setText(`Paused: ${audio.textContent}`);
		} else {
			this.btnPlayPause.setText('⏸️');
			this.nowPlayingDisplay.setText('');
		}
	}

	pauseCurrent() {
		const audio = this.audioElements[this.selectedTrackIdx];
		if (audio) {
			audio.pause();
			this.updatePlayPauseText();
		}
	}

	goToNext() {
		// first, pause the currently playing track if there is one
		this.restartSelectedTrack();
		// increment the selected track index
		this.selectedTrackIdx = (this.selectedTrackIdx + 1) % this.audioElements.length;
		this.playCurrent();
	}

	goToPrev() {
		// if we're on the first track, just restart it and return
		this.restartSelectedTrack();
		if (this.selectedTrackIdx === 0 && this.audioElements.length >= 1) {
			this.restartSelectedTrack()
			this.playCurrent()
			return
		}
		this.selectedTrackIdx -= 1;
		this.playCurrent();
	}

	togglePlayback() {
		console.log("toggling")
		const currentAudio = this.audioElements[this.selectedTrackIdx];
		if (!currentAudio && this.audioElements.length === 0) {
			return
		}
		if (!currentAudio) {
			this.selectedTrackIdx = 0;
			this.playCurrent();
			return
		}
		if (currentAudio.paused) {
			this.playCurrent();
		} else {
			this.pauseCurrent();
		}
	}

	playCurrent() {
		const audio = this.audioElements[this.selectedTrackIdx];
		if (audio) {
			audio.play();
			this.updatePlayPauseText();
		}
	}

	playTrack(idx: number) {
		this.restartSelectedTrack();
		this.selectedTrackIdx = idx;
		this.playCurrent();
	}
}
