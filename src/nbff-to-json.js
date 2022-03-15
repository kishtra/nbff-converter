let NBFFjsonModel
let type = null
let numOfNodes = 0
let level = 0
let result = []

const POSITIONS = {
	lvlUp: -1,
	lvlDown: -1,
	targetStart: -1,
	targetEnd: -1,
}
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

async function nbffToJSON(nbffString, midFunction = createParseTree, model) {
	NBFFjsonModel = model
	type = null
	numOfNodes = 0
	level = 0
	result = []

	POSITIONS.lvlUp = nbffString.indexOf(TAGS.DLOpen)
	POSITIONS.lvlDown = nbffString.indexOf(TAGS.DLClose)

	let tag = null
	let node = null
	let tmp = null

	while ((tag = getNextValidTag(nbffString)) !== null) {
		node = returnAsObject(tag)
		if ((tmp = await midFunction(node)) !== undefined) {
			result.push(tmp)
		}
	}

	return { level: 0, id: 0, numOfNodes: numOfNodes, [NBFFjsonModel.CHILDREN]: result }
}

function getNextValidTag(nbffString) {
	let tag = null

	POSITIONS.targetStart = nbffString.indexOf(TAGS.DT, POSITIONS.targetStart + 1)

	while (POSITIONS.targetStart > POSITIONS.lvlUp && POSITIONS.lvlUp !== -1) {
		level++
		POSITIONS.lvlUp = nbffString.indexOf(TAGS.DLOpen, POSITIONS.lvlUp + 1)
	}

	while (POSITIONS.targetStart > POSITIONS.lvlDown && POSITIONS.lvlDown !== -1) {
		level--
		POSITIONS.lvlDown = nbffString.indexOf(TAGS.DLClose, POSITIONS.lvlDown + 1)
	}

	if (POSITIONS.targetStart !== -1) {
		const tagType = nbffString.substr(
			POSITIONS.targetStart + TAGS.DT.length,
			TAGS.targetOpeningTagLength
		)

		if (tagType === TAGS.linkOpen) {
			type = 'url'
			POSITIONS.targetEnd =
				nbffString.indexOf(TAGS.linkClose, POSITIONS.targetStart) +
				TAGS.linkClose.length
		} else if (tagType === TAGS.folderOpen) {
			type = 'folder'
			POSITIONS.targetEnd =
				nbffString.indexOf(TAGS.folderClose, POSITIONS.targetStart) +
				TAGS.folderClose.length
		} else {
			type = null
			console.error(
				`Invalid tag type at index [${POSITIONS.targetStart + TAGS.DT.length}]!`
			)
			return null
		}

		tag = nbffString.substring(
			POSITIONS.targetStart + TAGS.DT.length,
			POSITIONS.targetEnd
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

export default nbffToJSON
