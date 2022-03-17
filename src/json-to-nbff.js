let NBFFjsonModel

function jsonToNBFF(jsonTree, nbffHeader, tabSpaces = 4, model) {
	NBFFjsonModel = model

	let parentsArr = [jsonTree]
	let child = null
	let childIndex = null
	let childrenArr = null
	let tabNum = parentsArr.length
	let numOfNodes = 0
	let nbffStr = nbffHeader + '<DL><p>'

	while (tabNum) {
		if (!childIndex && !childrenArr) {
			childrenArr = parentsArr[parentsArr.length - 1][NBFFjsonModel.CHILDREN]

			if (child) childIndex = childrenArr.indexOf(child) + 1
			else childIndex = 0
		}

		if ((child = childrenArr[childIndex])) {
			numOfNodes++
			nbffStr += returnAsElementString(child, tabNum, tabSpaces)

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
			nbffStr += '\n' + ' '.repeat(tabNum * tabSpaces) + '</DL><p>'
		}
	}

	return { nbffStr: nbffStr, numOfNodes: numOfNodes }
}

function returnAsElementString(jsonNode, tabNum, tabSpaces) {
	const newlineIndent = '\n' + ' '.repeat(tabNum * tabSpaces)

	var attributes = ''
	for (const key in NBFFjsonModel) {
		if (key !== 'INNER_TEXT' && key !== 'CHILDREN')
			for (const prop in jsonNode) {
				attributes +=
					prop === NBFFjsonModel[key] ? ` ${key}="${jsonNode[prop]}"` : ''
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

module.exports.jsonToNBFF = jsonToNBFF
