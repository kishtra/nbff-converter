# Netscape Bookmark File Format Converter

This is an _independent, promise-based, Vanilla JS_ tool used for converting between [_Netscape Bookmark File Format_](<https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/aa753582(v=vs.85)>) and [_JSON_](https://en.wikipedia.org/wiki/JSON).

## Table of Contents

-   [Features](#features)
    -   [Conversion options](#conversion-options)
    -   [Configurability](#configurability)
-   [Setup](#setup)
-   [Usage](#usage)
    -   [Default created/expected JSON node parameter names](#default-createdexpected-json-node-parameter-names)
    -   [Create a converter](#create-a-converter)
    -   [Convert](#convert)
    -   [Exception throwing](#exception-throwing)
-   [Project Status](#project-status)
-   [Room for Improvement](#room-for-improvement)
-   [Contact](#contact)
-   [License](#license)

## Features

### Conversion options:

-   NBFF (subfolder and shortcut item) --> JSON node (by default sorted into a JSON tree)
-   JSON tree --> NBFF (subfolder and shortcut item)

### Configurability:

-   Change created/expected JSON node property names
-   Pass a custom JSON node processing midFunction

## Setup

`npm install nbff-converter`

## Usage

### Default created/expected JSON node property names:

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

### Create a converter:

```
let nbffConverter = new NBFFConverter(yourNBFFjsonModel?)
```

### Convert:

#### - NBFF to JSON

```
nbffConverter.netscapeToJSON(nbffString, midFunction?)
	.then((result) => console.log(result))
```

##### The `midFunction` parameter looks like:

`(node: NBFFjsonModelNode) => void | any | Promise`

#### - JSON to NBFF

```
nbffConverter.JSONToNetscape(jsonTree, header?, tabSpaces?)
	.then((result) => console.log(result))
```

### Get NBFF header:

```
let nbffHeader = nbffConverter.header
```

### Exception throwing:

-   Throws an exception if an invalid argument is given

## Project Status

Project is: _in backwards compatible progress_

## Room for Improvement

-   Support for other NBFF items?
-   Completely customizable item attribute names?

To do:

-   Other possible subfolder/shortcut attributes

## Contact

Created by [@kishtra](https://github.com/kishtra) - feel free to contact me!

## License

This project is open source and available under the [MIT License](https://choosealicense.com/licenses/mit/).
