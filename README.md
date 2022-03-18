# Netscape Bookmark File Format Converter

This is an _independent, promise-based_ tool used for converting between [_Netscape Bookmark File Format_](<https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/aa753582(v=vs.85)>) and [_JSON_](https://en.wikipedia.org/wiki/JSON).

## Table of Contents

-   [Features](#features)
    -   [Conversion options](#conversion-options)
    -   [Configurability](#configurability)
-   [Setup](#setup)
    -   [Install](#install)
    -   [Import](#import)
-   [Usage](#usage)
    -   [Default created/expected JSON node property names](#default-createdexpected-json-node-property-names)
    -   [Create a converter](#create-a-converter)
    -   [Convert](#convert)
        -   [NBFF to JSON](#nbff-to-json)
        -   [JSON to NBFF](#json-to-nbff)
    -   [Get NBFF header](#get-nbff-header)
    -   [Exception throwing](#exception-throwing)
-   [Examples](#examples)
    -   [Using the **default** _NBFFjsonModel_](#using-the-default-nbffjsonmodel)
    -   [Using a **custom** _NBFFjsonModel_](#using-a-custom-nbffjsonmodel)
-   [Project Status](#project-status)
-   [Room for Improvement](#room-for-improvement)
-   [Contact](#contact)
-   [License](#license)

## Features

### Conversion options

-   NBFF (subfolder and shortcut item) --> JSON node (by default sorted into a JSON tree)
-   JSON tree --> NBFF (subfolder and shortcut item)

### Configurability

-   Change created/expected JSON node property names
-   Pass a custom JSON node processing midFunction

## Setup

### Install

```Shell
npm install nbff-converter
```

### Import

```javascript
const NBFFConverter = require('nbff-converter')
```

## Usage

### Default created/expected JSON node property names

```javascript
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

```javascript
const nbffConverter = new NBFFConverter(yourNBFFjsonModel?)
```

### Convert

-   #### NBFF to JSON

```javascript
nbffConverter.netscapeToJSON(nbffString, midFunction?)
	.then((result) => console.log(result))
```

##### The `midFunction` parameter looks like:

`(node: NBFFjsonModelNode) => void | any | Promise`

> ##### **Tip**: When passing a method as `midFunction`, you can [**bind**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) its `this`.

##### The values inside the `Promise` look like:

`{ level: Number, id: Number, numOfNodes: Number, [NBFFjsonModel.CHILDREN]: Array }`

-   #### JSON to NBFF

```javascript
nbffConverter.jsonToNetscape(jsonTree, header?, tabSpaces?)
	.then((result) => console.log(result))
```

##### The values inside the `Promise` look like:

`{ nbffStr: String, numOfNodes: Number }`

### Get NBFF header

```javascript
let nbffHeader = nbffConverter.header
```

_Result_:

```HTML
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!--This is an automatically generated file.
	It will be read and overwritten.
	Do Not Edit! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<Title>Bookmarks</Title>
<H1>Bookmarks</H1>
```

### Exception throwing

`TypeError | ReferenceError | RangeError`

## Examples

### Using the **default** _NBFFjsonModel_

_dummy.html_

```HTML
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!--This is an automatically generated file.
	It will be read and overwritten.
	Do Not Edit! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<Title>Bookmarks</Title>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3>dummy folder 1</H3>
    <DL><p>
        <DT><A HREF="http://dummyURL.dne">Does not exist</A>
        <DT><H3>dummy folder 2</H3>
        <DL><p>
            <DT><A HREF="http://dummyURL.idne">It does not exist</A>
        </DL><p>
    </DL><p>
    <DT><A HREF="http://dummyURL.sdne">Still does not exist</A>
    <DT><H3>dummy folder 3</H3>
    <DL><p>
        <DT><A HREF="http://dummyURL.nidne">No, it does not exist</A>
    </DL><p>
</DL><p>
```

_convert-to-json.js_

```javascript
const fs = require('fs')
const NBFFConverter = require('nbff-converter')

const nbffString = fs.readFileSync('./dummy.html', 'utf8')
const nbffConverterDefault = new NBFFConverter()

nbffConverterDefault.netscapeToJSON(nbffString).then((result) => {
	fs.writeFileSync('result.json', JSON.stringify(result, null, 4))
})

// Simple midFunction example:
const myMidFunction = (node) => node.title

nbffConverterDefault.netscapeToJSON(nbffString, myMidFunction).then((result) => {
	fs.writeFileSync('myMidFunctionResult.json', JSON.stringify(result, null, 4))
})
```

_result.json_

```JSON
{
    "level": 0,
    "id": 0,
    "numOfNodes": 7,
    "children": [
        {
            "level": 1,
            "id": 1,
            "type": "folder",
            "title": "dummy folder 1",
            "children": [
                {
                    "level": 2,
                    "id": 2,
                    "type": "url",
                    "url": "http://dummyURL.dne",
                    "title": "Does not exist"
                },
                {
                    "level": 2,
                    "id": 3,
                    "type": "folder",
                    "title": "dummy folder 2",
                    "children": [
                        {
                            "level": 3,
                            "id": 4,
                            "type": "url",
                            "url": "http://dummyURL.idne",
                            "title": "It does not exist"
                        }
                    ]
                }
            ]
        },
        {
            "level": 1,
            "id": 5,
            "type": "url",
            "url": "http://dummyURL.sdne",
            "title": "Still does not exist"
        },
        {
            "level": 1,
            "id": 6,
            "type": "folder",
            "title": "dummy folder 3",
            "children": [
                {
                    "level": 2,
                    "id": 7,
                    "type": "url",
                    "url": "http://dummyURL.nidne",
                    "title": "No, it does not exist"
                }
            ]
        }
    ]
}
```

_myMidFunctionResult.json_

```JSON
{
    "level": 0,
    "id": 0,
    "numOfNodes": 7,
    "children": [
        "dummy folder 1",
        "Does not exist",
        "dummy folder 2",
        "It does not exist",
        "Still does not exist",
        "dummy folder 3",
        "No, it does not exist"
    ]
}
```

### Using a **custom** _NBFFjsonModel_

_dummy.json_

```JSON
{
    "contents": [
        {
            "name": "dummy folder 1",
            "contents": [
                { "shortcut": "http://dummyURL.dne", "name": "Does not exist" },
                {
                    "name": "dummy folder 2",
                    "contents": [
                        { "shortcut": "http://dummyURL.idne", "name": "It does not exist" }
                    ]
                }
            ]
        },
        { "shortcut": "http://dummyURL.sdne", "name": "Still does not exist" },
        {
            "name": "dummy folder 3",
            "contents": [
                { "shortcut": "http://dummyURL.nidne", "name": "No, it does not exist" }
            ]
        }
    ]
}
```

_convert-to-nbff.js_

```javascript
const fs = require('fs')
const NBFFConverter = require('nbff-converter')

const jsonString = fs.readFileSync('./dummy.json', 'utf8')
const jsonData = JSON.parse(jsonString)

const myCustomModel = { CHILDREN: 'contents', INNER_TEXT: 'name', HREF: 'shortcut' }
const nbffConverterCustom = new NBFFConverter(myCustomModel)

nbffConverterCustom.jsonToNetscape(jsonData, true, 4).then((result) => {
	fs.writeFileSync('result.html', result.nbffStr)
})
```

_result.html_

```HTML
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!--This is an automatically generated file.
	It will be read and overwritten.
	Do Not Edit! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<Title>Bookmarks</Title>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3>dummy folder 1</H3>
    <DL><p>
        <DT><A HREF="http://dummyURL.dne">Does not exist</A>
        <DT><H3>dummy folder 2</H3>
        <DL><p>
            <DT><A HREF="http://dummyURL.idne">It does not exist</A>
        </DL><p>
    </DL><p>
    <DT><A HREF="http://dummyURL.sdne">Still does not exist</A>
    <DT><H3>dummy folder 3</H3>
    <DL><p>
        <DT><A HREF="http://dummyURL.nidne">No, it does not exist</A>
    </DL><p>
</DL><p>
```

## Project Status

Project is: _in progress_

## Room for Improvement

-   Support for other NBFF items?
-   Completely customizable item attribute names?

To do:

-   Other possible subfolder/shortcut attributes

## Contact

Created by [@kishtra](https://github.com/kishtra) - feel free to contact me!

## License

This project is open source and available under the [MIT License](https://choosealicense.com/licenses/mit/).
