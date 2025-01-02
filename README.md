# Mixtape

This is an Obsidian plugin for managing audio projects.

The idea is to be able to keep audio files of versions of your songs in Obsidian, so you can listen and write notes in the same place. With that workflow, this plugin allows you to render all your audiofiles in a tracklist, so you can listen to them in a playlist style directly in Obsidian.

## Installation

1. Navigate to your vault's directory in the terminal.
2. run `cd .obsidian && mkdir -p plugins && cd plugins && git clone https://github.com/jesses-code-adventures/obsidian-mixtape obsidian-mixtape`
3. In Obsidian, run `Reload app without saving` from the command palette.

## Usage

1. Have a directory for the project you're working on, and have a file in there called `_PROJECT.md` that has your audio files in the order you want them. _nb: this filename can be changed in the plugin's settings._
2. Create a file in that folder (I like to call it `_mixtape.md`) and create a `mixtape` element in a codeblock (triple backticks).

````text
```mixtape
```
````

3. Go into presentation mode to see your media player.

<img width="600" alt="Screenshot 2024-12-24 at 2 37 42 am" src="https://github.com/user-attachments/assets/8f0174bb-2819-475d-aaf6-356870437714" />

### Customization

In the `Community Plugins` tab within Obsidian's settings, you can click the gear icon to access settings for this plugin.

-   **Default Tracks Filename**: This is the filename Mixtape falls back to if it detects an empty codeblock. Defaults to `_PROJECT.md`.
-   **Player Codeblock Label**: The name of the codeblock label the plugin searches for to inject the tracklist. Defaults to `mixtape`.

If you prefer, you can also maintain the order of files by having a markdown file per song and using a list of filenames in your codeblock.

With this setup, you could do something like the following, allowing you to experiment with the flow of the project more easily.

````text
```mixtape
song1.md
song3.md
song2.md
```
````

## Planned Feautures

-   [ ] "Restrict To Title" setting, where the user should be able to specify a markdown title in which the audio files should ONLY be scraped from. This would be nice for having something like a `# Current Version` title that you want Mixtape to exclusively scrape from, so you can still keep your previous versions in the same file under a different heading.
