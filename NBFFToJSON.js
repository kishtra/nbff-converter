let NBFFjsonModel

let numOfNodes = 0
let level = -1
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
	targetsOpeningTagLength: 2,
	folderOpen: '<H',
	linkOpen: '<A',
	folderClose: '</H3>',
	linkClose: '</A>',
}

/**
 * Parses Netscape Bookmarks File Format string and returns a JSON parse tree.
 * Optionaly pass a midFunction which will be invoked for every valid
 * bookmark/folder tag with corresponding bookmark/folder object node as an argument.
 *
 * @param {String} htmlString Netscape Bookmarks File Format string to convert.
 * @param {Function} midFunction Optional user defined function. Takes one object
 * 								 argument for every valid bookmark tag.
 * 								 If not provided, the default function will create
 * 								 and return a parse tree.
 *
 * @returns {Promise}
 * - onResolved: Parse tree object with 'children' and 'numOfNodes' properties.
 * - onRejected: TO DO!
 */
function NBFFToJSON(htmlString, midFunction = createParseTree, attrProp) {
	NBFFjsonModel = attrProp
	POSITIONS.lvlUp = htmlString.indexOf(TAGS.DLOpen)
	POSITIONS.lvlDown = htmlString.indexOf(TAGS.DLClose)

	return new Promise(async (onResolved, onRejected) => {
		let tag = null
		let node = null

		while ((tag = getNextValidTag(htmlString))) {
			node = returnAsObject(tag)
			await midFunction(node)
		}

		onResolved({ [NBFFjsonModel.CHILDREN]: result, numOfNodes: numOfNodes })
	})
}

function getNextValidTag(htmlString) {
	let tag = null

	POSITIONS.targetStart = htmlString.indexOf(TAGS.DT, POSITIONS.targetStart + 1)

	while (POSITIONS.targetStart > POSITIONS.lvlUp && POSITIONS.lvlUp !== -1) {
		level++
		POSITIONS.lvlUp = htmlString.indexOf(TAGS.DLOpen, POSITIONS.lvlUp + 1)
	}

	while (POSITIONS.targetStart > POSITIONS.lvlDown && POSITIONS.lvlDown !== -1) {
		level--
		POSITIONS.lvlDown = htmlString.indexOf(TAGS.DLClose, POSITIONS.lvlDown + 1)
	}

	if (POSITIONS.targetStart !== -1) {
		const tagType = htmlString.substr(
			POSITIONS.targetStart + TAGS.DT.length,
			TAGS.targetsOpeningTagLength
		)

		if (tagType === TAGS.linkOpen) {
			POSITIONS.targetEnd =
				htmlString.indexOf(TAGS.linkClose, POSITIONS.targetStart) +
				TAGS.linkClose.length
		} else if (tagType === TAGS.folderOpen) {
			POSITIONS.targetEnd =
				htmlString.indexOf(TAGS.folderClose, POSITIONS.targetStart) +
				TAGS.folderClose.length
		} else {
			console.error('Invalid tag type!')
			return null
		}

		tag = htmlString.substring(
			POSITIONS.targetStart + TAGS.DT.length,
			POSITIONS.targetEnd
		)

		numOfNodes++
	}

	return tag
}

function returnAsObject(bookmarkTagStr) {
	let bookmarkObj = { level: level }

	let attrStart = -1
	let attrValStart = -1
	let attrValEnd = -1
	let titleStart = -1
	let titleEnd = -1

	for (const key in NBFFjsonModel) {
		if ((attrStart = bookmarkTagStr.indexOf(key)) !== -1) {
			attrValStart = attrStart + key.length + '="'.length
			attrValEnd = bookmarkTagStr.indexOf('"', attrValStart)
			bookmarkObj[NBFFjsonModel[key]] = bookmarkTagStr.substring(
				attrValStart,
				attrValEnd
			)
		}
	}

	bookmarkObj.type = bookmarkObj.url ? 'url' : 'folder'

	titleStart = bookmarkTagStr.indexOf('>') + 1
	titleEnd = bookmarkTagStr.indexOf('<', titleStart)
	bookmarkObj[NBFFjsonModel.INNER_TEXT] = bookmarkTagStr.substring(titleStart, titleEnd)

	return bookmarkObj
}

function createParseTree(node) {
	let lastParent = null

	while (
		(lastParent = result.length ? result[result.length - 1] : { level: -1 }).level >=
			node.level &&
		lastParent.level !== 0
	)
		result.pop()

	if (node.level > 0) lastParent[NBFFjsonModel.CHILDREN].push(node)

	if (node.type === 'folder') {
		node[NBFFjsonModel.CHILDREN] = []
		result.push(node)
	} else if (node.type === 'url' && node.level === 0) result.push(node)
}

export default NBFFToJSON
