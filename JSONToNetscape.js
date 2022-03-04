import globals from './globals.js'

let attr_prop = globals.attr_prop
let nodeTitleProperty = 'title'

const netscapeHeader = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!--This is an automatically generated file.
    It will be read and overwritten.
    Do Not Edit! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<Title>Bookmarks</Title>
<H1>Bookmarks</H1>`

/**
 * Traverses bookmarks JSON object, converts every node to an element and
 * populates the bookmarksDOM in JSON object structure order.
 * @param {JSON} json JSON object.
 * @param {Number} tabSpaces Defaults to 4 spaces per tab (optional).
 * @returns {String}  A string in Netscape Bookmarks File Format.
 */
function JSONToNetscape(json, tabSpaces = 4, header = true) {
	let parentsArr = [json]
	let child = null
	let childIndex = null
	let childrenArr = null

	let tabNum = parentsArr.length
	let netscapeStr = ''
	if (header) netscapeStr = netscapeHeader + '\n<DL><p>'

	while (tabNum) {
		if (!childIndex && !childrenArr) {
			childrenArr = parentsArr[parentsArr.length - 1].children

			if (child) childIndex = childrenArr.indexOf(child) + 1
			else childIndex = 0
		}

		if ((child = childrenArr[childIndex])) {
			netscapeStr += returnAsElementString(child, tabNum, tabSpaces)

			if (child.children) {
				parentsArr.push(child)
				childIndex = 0
				childrenArr = child.children
				tabNum = parentsArr.length
			} else childIndex++
		} else {
			child = parentsArr.pop()
			childIndex = null
			childrenArr = null
			tabNum = parentsArr.length
			netscapeStr += '\n' + ' '.repeat(tabNum * tabSpaces) + '</DL><p>'
		}
	}

	return netscapeStr
}

function returnAsElementString(jsonNode, tabNum, tabSpaces) {
	let title = 'Unnamed'
	const newlineIndent = '\n' + ' '.repeat(tabNum * tabSpaces)

	// TO DO: make attributes optional when setting up the parser
	if (attr_prop) {
		var attributes = ''
		for (const prop in jsonNode) {
			for (const attr in attr_prop) {
				attributes +=
					prop === attr_prop[attr] ? ` ${attr}="${jsonNode[prop]}"` : ''
			}
		}
	}

	if (jsonNode.children) {
		return `${newlineIndent}<DT><H3${attributes}>${jsonNode[nodeTitleProperty]}</H3>${newlineIndent}<DL><p>`
	} else {
		return `${newlineIndent}<DT><A${attributes}>${jsonNode[nodeTitleProperty]}</A>`
	}
}

export default JSONToNetscape
