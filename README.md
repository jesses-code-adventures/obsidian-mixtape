# obsidian-mixtape (WIP)

this is an obsidian plugin for the three people in the world that make music on the computer and are also obsidian power users.

the goal is to be able to maintain separate files that contain audio, and for the plugin the be able to be passed those files and scrape them for audio clips.

the scraped audio clips should be arranged in the order of the pages that were passed in, and in the order they appear on the pages themselves.

this allows the user to keep track of notes on audio files, switch out the audio files (eg replace with a new version) and similar, so as to be able to keep all the progress for a project within obsidian and immediately have a listenable playlist of audio files to work with.

## usage

1. In your current folder there should be a file, or a collection of files, that contain audio links.
2. Create a file in that folder (I like to call it \_mixtape.md) and create a `mixtape` element in triple backticks. Inside the element, list the file or files to scrape the audio from.

````text
```mixtape
_PROJECT.md
```
````

3. Go into presentation mode to see your media player.
