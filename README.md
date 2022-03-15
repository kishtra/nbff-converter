# Netscape Bookmark File Format Converter

> This is an independent, promise-based, Vanilla JS tool used for converting [_Netscape Bookmark File Format_](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/aa753582(v=vs.85)).
>
> Conversion options:
> - NBFF subfolder and shortcut item --> JSON node (by default sorted into a JSON parse tree)
> - JSON tree --> NBFF

## General Information
- Made in a quest for knowledge
- Intended for my bookmark manager extension (to be finished)
- Inspired by the idea of wholeness

## Features
- Change created/expected JSON node property names.
- Pass a custom JSON node processing midFunction

## Setup
Proceed to describe how to install / setup one's local environment / get started with the project.

## Usage
### Reference of default created/expected JSON node `{ KEY: value }` pairs
```
#NBFFjsonModel = {
	CHILDREN: 'children',
	INNER_TEXT: 'title',
	HREF: 'url',
	ADD_DATE: 'dateAdded',
	LAST_VISIT: 'dateLastVisited',
	LAST_MODIFIED: 'dateModified',
	PERSONAL_TOOLBAR_FOLDER: 'personalToolbarFolder',
}
```
### Create a converter
```
let nbffConverter = new NBFFConverter(yourNBFFjsonModel?)
```
### Convert
#### NBFF to JSON
```
nbffConverter.netscapeToJSON(nbffString, midFunction?).then((result) => console.log(result))
```
##### The `midFunction` parameter should look like:
```
(node: NBFFjsonModelNode) => void/Promise?
``` 
#### JSON to NBFF
```
nbffConverter.JSONToNetscape(jsonTree, header?, tabSpaces?).then((result) => console.log(result))
```
## Project Status
Project is: _in backwards compatible progress_


## Room for Improvement
- Support for other NBFF items?
- Completely customizable item attribute names?

To do:
- Other possible subfolder/shortcut attributes

## Contact
Created by [@kishtra](https://github.com/kishtra) - feel free to contact me!


<!-- Optional -->
<!-- ## License -->
<!-- This project is open source and available under the [... License](). -->

<!-- You don't have to include all sections - just the one's relevant to your project -->
