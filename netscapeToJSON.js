import globals from './globals.js'

let nodeNum = globals.nodeNum
let level = globals.level
let positions = globals.positions
let tags = globals.tags
let attr_prop = globals.attr_prop

let result = []

/**
 * Parses Netscape Bookmarks File Format string and returns a JSON parse tree.
 * Optionaly pass a midFunction which will be invoked for every valid
 * bookmark/folder tag with corresponding bookmark/folder object node as argument.
 * @param {String} htmlString Netscape Bookmarks File Format string to traverse.
 * @param {Function} midFunction Optional user defined function.
 * 								 If not provided, the default function
 * 								 will create a parse tree.
 * @returns {Promise} (Promise) onResolved: an object with
 * 					  'children' and 'nodeNum' properties.
 */
function netscapeToJSON(htmlString, midFunction = createParseTree.bind()) {
	positions.lvlUp = htmlString.indexOf(tags.DLOpen)
	positions.lvlDown = htmlString.indexOf(tags.DLClose)

	return new Promise(async (onResolved, onRejected) => {
		let tag = null
		let node = null

		while ((tag = getNextValidTag(htmlString))) {
			node = returnAsObject(tag)
			await midFunction(node)
		}

		onResolved({ children: result, nodeNum: nodeNum })

		result = []
		level = -1
	})
}

function getNextValidTag(htmlString) {
	let tag = null

	positions.targetStart = htmlString.indexOf(tags.DT, positions.targetStart + 1)

	while (positions.targetStart > positions.lvlUp && positions.lvlUp !== -1) {
		level++
		positions.lvlUp = htmlString.indexOf(tags.DLOpen, positions.lvlUp + 1)
	}

	while (positions.targetStart > positions.lvlDown && positions.lvlDown !== -1) {
		level--
		positions.lvlDown = htmlString.indexOf(tags.DLClose, positions.lvlDown + 1)
	}

	if (positions.targetStart !== -1) {
		const tagType = htmlString.substr(
			positions.targetStart + tags.DT.length,
			tags.targetsOpeningTagLength
		)

		if (tagType === tags.linkOpen) {
			positions.targetEnd =
				htmlString.indexOf(tags.linkClose, positions.targetStart) +
				tags.linkClose.length
		} else if (tagType === tags.folderOpen) {
			positions.targetEnd =
				htmlString.indexOf(tags.folderClose, positions.targetStart) +
				tags.folderClose.length
		} else {
			console.error('Invalid tag type!')
			return null
		}

		tag = htmlString.substring(
			positions.targetStart + tags.DT.length,
			positions.targetEnd
		)

		nodeNum++
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

	for (const attr in attr_prop) {
		if ((attrStart = bookmarkTagStr.indexOf(attr)) !== -1) {
			attrValStart = attrStart + attr.length + '="'.length
			attrValEnd = bookmarkTagStr.indexOf('"', attrValStart)
			bookmarkObj[attr_prop[attr]] = bookmarkTagStr.substring(
				attrValStart,
				attrValEnd
			)
		}
	}

	titleStart = bookmarkTagStr.indexOf('>') + 1
	titleEnd = bookmarkTagStr.indexOf('<', titleStart)
	bookmarkObj.title = bookmarkTagStr.substring(titleStart, titleEnd)

	return bookmarkObj
}

function createParseTree(node) {
	let lastParent = null

	while (
		(lastParent = result.length ? result[result.length - 1] : { level: -1 })
			.level >= node.level &&
		lastParent.level !== 0
	)
		result.pop()

	if (node.level > 0) lastParent.children.push(node)

	if (!node.url) {
		node.children = []
		result.push(node)
	} else if (node.level === 0) result.push(node)
}

export default netscapeToJSON
