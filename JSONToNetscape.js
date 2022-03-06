import globals from './globals.js'

const attr_prop = globals.attr_prop
const nodeTitleProperty = 'title'

const netscapeHeader = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!--This is an automatically generated file.
    It will be read and overwritten.
    Do Not Edit! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<Title>Bookmarks</Title>
<H1>Bookmarks</H1>`

let nodeNum = 0

/**
 * Traverses JSON tree, converts every valid node to an element string and
 * returns a Netscape Bookmarks File Format string.
 *
 * @param {JSON} json - JSON object.
 * @param {Boolean} header - Decide if netscape header is included. Defaults to true.
 * @param {Number} tabSpaces - Spaces per tab. Defaults to 4.
 *
 * @returns {String}  Netscape Bookmarks File Format string.
 */
function JSONToNetscape(json, header = true, tabSpaces = 4) {
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

	return { netscapeStr: netscapeStr, nodeNum: nodeNum }
}

function returnAsElementString(jsonNode, tabNum, tabSpaces) {
	nodeNum++

	const newlineIndent = '\n' + ' '.repeat(tabNum * tabSpaces)

	var attributes = ''
	for (const prop in jsonNode) {
		for (const attr in attr_prop) {
			attributes += prop === attr_prop[attr] ? ` ${attr}="${jsonNode[prop]}"` : ''
		}
	}

	if (jsonNode.children) {
		return `${newlineIndent}<DT><H3${attributes}>${jsonNode[nodeTitleProperty]}</H3>${newlineIndent}<DL><p>`
	} else {
		return `${newlineIndent}<DT><A${attributes}>${jsonNode[nodeTitleProperty]}</A>`
	}
}

export default JSONToNetscape
