let NBFFjsonModel

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
function convertJSONToNetscape(json, NBFFHeader, tabSpaces = 4, attrProp) {
	NBFFjsonModel = attrProp

	let parentsArr = [json]
	let child = null
	let childIndex = null
	let childrenArr = null
	let tabNum = parentsArr.length
	let numOfNodes = 0
	let NBFFString = NBFFHeader + '<DL><p>'

	while (tabNum) {
		if (!childIndex && !childrenArr) {
			childrenArr = parentsArr[parentsArr.length - 1][NBFFjsonModel.CHILDREN]

			if (child) childIndex = childrenArr.indexOf(child) + 1
			else childIndex = 0
		}

		if ((child = childrenArr[childIndex])) {
			numOfNodes++
			NBFFString += returnAsElementString(child, tabNum, tabSpaces)

			if (child[NBFFjsonModel.CHILDREN]) {
				parentsArr.push(child)
				childIndex = 0
				childrenArr = child[NBFFjsonModel.CHILDREN]
				tabNum = parentsArr.length
			} else childIndex++
		} else {
			child = parentsArr.pop()
			childIndex = null
			childrenArr = null
			tabNum = parentsArr.length
			NBFFString += '\n' + ' '.repeat(tabNum * tabSpaces) + '</DL><p>'
		}
	}

	return { NBFFString: NBFFString, numOfNodes: numOfNodes }
}

function returnAsElementString(jsonNode, tabNum, tabSpaces) {
	const newlineIndent = '\n' + ' '.repeat(tabNum * tabSpaces)

	var attributes = ''
	for (const prop in jsonNode) {
		for (const key in NBFFjsonModel) {
			if (key === 'INNER_TEXT' || key === 'CHILDREN') continue
			attributes += prop === NBFFjsonModel[key] ? ` ${key}="${jsonNode[prop]}"` : ''
		}
	}

	if (jsonNode[NBFFjsonModel.CHILDREN]) {
		return `${newlineIndent}<DT><H3${attributes}>${
			jsonNode[NBFFjsonModel.INNER_TEXT]
		}</H3>${newlineIndent}<DL><p>`
	} else {
		return `${newlineIndent}<DT><A${attributes}>${
			jsonNode[NBFFjsonModel.INNER_TEXT]
		}</A>`
	}
}

export default convertJSONToNetscape
