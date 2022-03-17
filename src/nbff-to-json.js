let NBFFjsonModel

const TAGS = {
	DT: '<DT>',
	DLOpen: '<DL>',
	DLClose: '</DL>',
	targetOpeningTagLength: 2,
	folderOpen: '<H',
	linkOpen: '<A',
	folderClose: '</H3>',
	linkClose: '</A>',
}

async function nbffToJSON(nbffString, midFunction, model) {
	NBFFjsonModel = model
	midFunction ??= createParseTree

	let tag = null
	let node = null
	let type = null
	let tmp = null
	let numOfNodes = 0
	let level = 0
	let result = []

	let positions = {
		lvlUp: -1,
		lvlDown: -1,
		targetStart: -1,
		targetEnd: -1,
	}

	positions.lvlUp = nbffString.indexOf(TAGS.DLOpen)
	positions.lvlDown = nbffString.indexOf(TAGS.DLClose)

	while ((tag = getNextValidTag(nbffString)) !== null) {
		node = returnAsObject(tag)
		if ((tmp = await midFunction(node)) !== undefined) {
			result.push(tmp)
		}
	}

	function getNextValidTag(nbffString) {
		let tag = null

		positions.targetStart = nbffString.indexOf(TAGS.DT, positions.targetStart + 1)

		while (positions.targetStart > positions.lvlUp && positions.lvlUp !== -1) {
			level++
			positions.lvlUp = nbffString.indexOf(TAGS.DLOpen, positions.lvlUp + 1)
		}

		while (positions.targetStart > positions.lvlDown && positions.lvlDown !== -1) {
			level--
			positions.lvlDown = nbffString.indexOf(TAGS.DLClose, positions.lvlDown + 1)
		}

		if (positions.targetStart !== -1) {
			const tagType = nbffString.substr(
				positions.targetStart + TAGS.DT.length,
				TAGS.targetOpeningTagLength
			)

			if (tagType === TAGS.linkOpen) {
				type = 'url'
				positions.targetEnd =
					nbffString.indexOf(TAGS.linkClose, positions.targetStart) +
					TAGS.linkClose.length
			} else if (tagType === TAGS.folderOpen) {
				type = 'folder'
				positions.targetEnd =
					nbffString.indexOf(TAGS.folderClose, positions.targetStart) +
					TAGS.folderClose.length
			} else {
				type = null
				console.error(
					`Invalid tag type at index [${positions.targetStart + TAGS.DT.length}]!`
				)
				return null
			}

			tag = nbffString.substring(
				positions.targetStart + TAGS.DT.length,
				positions.targetEnd
			)

			numOfNodes++
		}

		return tag
	}

	function returnAsObject(bookmarkTagStr) {
		let node = { level: level, id: numOfNodes, type: type }

		let attrStart = -1
		let attrValStart = -1
		let attrValEnd = -1
		let titleStart = -1
		let titleEnd = -1

		for (const key in NBFFjsonModel) {
			if ((attrStart = bookmarkTagStr.indexOf(key)) !== -1) {
				attrValStart = attrStart + key.length + '="'.length
				attrValEnd = bookmarkTagStr.indexOf('"', attrValStart)
				node[NBFFjsonModel[key]] = bookmarkTagStr.substring(attrValStart, attrValEnd)
			}
		}

		titleStart = bookmarkTagStr.indexOf('>') + 1
		titleEnd = bookmarkTagStr.indexOf('<', titleStart)
		node[NBFFjsonModel.INNER_TEXT] = bookmarkTagStr.substring(titleStart, titleEnd)

		return node
	}

	function createParseTree(node) {
		let lastParent = null

		while (
			(lastParent = result.length ? result[result.length - 1] : { level: -1 }).level >=
				node.level &&
			lastParent.level !== 1
		)
			result.pop()

		if (node.level > 1) lastParent[NBFFjsonModel.CHILDREN].push(node)

		if (node.type === 'folder') {
			node[NBFFjsonModel.CHILDREN] = []
			result.push(node)
		} else if (node.type === 'url' && node.level === 1) result.push(node)
	}

	return { level: 0, id: 0, numOfNodes: numOfNodes, [NBFFjsonModel.CHILDREN]: result }
}

export default nbffToJSON
