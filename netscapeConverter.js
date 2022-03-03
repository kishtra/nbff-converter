const netscapeConverter = {
	tagNum: 0,
	level: -1,

	positions: {
		lvlUp: -1,
		lvlDown: -1,
		targetStart: -1,
		targetEnd: -1,
	},

	tags: {
		DT: '<DT>',
		DLOpen: '<DL>',
		DLClose: '</DL>',
		targetsOpeningTagLength: 2,
		folderOpen: '<H',
		linkOpen: '<A',
		folderClose: '</H3>',
		linkClose: '</A>',
	},

	attr_prop: {
		ADD_DATE: 'date_added',
		LAST_VISIT: 'dateLastVisited',
		LAST_MODIFIED: 'date_modified',
		PERSONAL_TOOLBAR_FOLDER: 'personalToolbarFolder',
		HREF: 'url',
		ICON: 'icon',
	},

	result: [],

	/**
	 * Parses Netscape Bookmarks File Format string and returns a JSON parse tree.
	 * Optionaly pass a midFunction which will be invoked for every valid
	 * bookmark/folder tag with corresponding bookmark/folder object node as argument.
	 * @param {String} htmlString Netscape Bookmarks File Format string to traverse.
	 * @param {Function} midFunction Optional user defined function.
	 * 								 If not provided, the default function
	 * 								 will create a parse tree.
	 * @returns {Promise} (Promise) onResolved: an object with
	 * 					  'children' and 'tagNum' properties.
	 *
	 */
	netscapeToJSON(htmlString, midFunction = this.createParseTree.bind(this)) {
		this.positions.lvlUp = htmlString.indexOf(this.tags.DLOpen)
		this.positions.lvlDown = htmlString.indexOf(this.tags.DLClose)

		return new Promise(async (onResolved, onRejected) => {
			let tag = null
			let node = null

			while ((tag = this.getNextValidTag(htmlString))) {
				node = this.returnAsObject(tag)
				await midFunction(node)
			}

			onResolved({ children: this.result, tagNum: this.tagNum })

			this.result = []
			this.level = -1
		})
	},

	getNextValidTag(htmlString) {
		let tag = null

		this.positions.targetStart = htmlString.indexOf(
			this.tags.DT,
			this.positions.targetStart + 1
		)

		while (
			this.positions.targetStart > this.positions.lvlUp &&
			this.positions.lvlUp !== -1
		) {
			this.level++
			this.positions.lvlUp = htmlString.indexOf(
				this.tags.DLOpen,
				this.positions.lvlUp + 1
			)
		}

		while (
			this.positions.targetStart > this.positions.lvlDown &&
			this.positions.lvlDown !== -1
		) {
			this.level--
			this.positions.lvlDown = htmlString.indexOf(
				this.tags.DLClose,
				this.positions.lvlDown + 1
			)
		}

		if (this.positions.targetStart !== -1) {
			const tagType = htmlString.substr(
				this.positions.targetStart + this.tags.DT.length,
				this.tags.targetsOpeningTagLength
			)

			if (tagType === this.tags.linkOpen) {
				this.positions.targetEnd =
					htmlString.indexOf(
						this.tags.linkClose,
						this.positions.targetStart
					) + this.tags.linkClose.length
			} else if (tagType === this.tags.folderOpen) {
				this.positions.targetEnd =
					htmlString.indexOf(
						this.tags.folderClose,
						this.positions.targetStart
					) + this.tags.folderClose.length
			} else {
				console.error('Invalid tag type!')
				return null
			}

			tag = htmlString.substring(
				this.positions.targetStart + this.tags.DT.length,
				this.positions.targetEnd
			)

			this.tagNum++
		}

		return tag
	},

	returnAsObject(bookmarkTagStr) {
		let bookmarkObj = { level: this.level }

		let attrStart = -1
		let attrValStart = -1
		let attrValEnd = -1
		let titleStart = -1
		let titleEnd = -1

		for (const attr in this.attr_prop) {
			if ((attrStart = bookmarkTagStr.indexOf(attr)) !== -1) {
				attrValStart = attrStart + attr.length + '="'.length
				attrValEnd = bookmarkTagStr.indexOf('"', attrValStart)
				bookmarkObj[this.attr_prop[attr]] = bookmarkTagStr.substring(
					attrValStart,
					attrValEnd
				)
			}
		}

		titleStart = bookmarkTagStr.indexOf('>') + 1
		titleEnd = bookmarkTagStr.indexOf('<', titleStart)
		bookmarkObj.title = bookmarkTagStr.substring(titleStart, titleEnd)

		return bookmarkObj
	},

	createParseTree(node) {
		let lastParent = null

		while (
			(lastParent = this.result.length
				? this.result[this.result.length - 1]
				: { level: -1 }).level >= node.level &&
			lastParent.level !== 0
		)
			this.result.pop()

		if (node.level > 0) lastParent.children.push(node)

		if (!node.url) {
			node.children = []
			this.result.push(node)
		} else if (node.level === 0) this.result.push(node)
	},

	nodeTitleProperty: 'title',

	netscapeHeader: `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!--This is an automatically generated file.
    It will be read and overwritten.
    Do Not Edit! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<Title>Bookmarks</Title>
<H1>Bookmarks</H1>`,

	/**
	 * Traverses bookmarks JSON object, converts every node to an element and
	 * populates the bookmarksDOM in JSON object structure order.
	 * @param {JSON} json JSON object.
	 * @param {Number} tabSpaces Defaults to 4 spaces per tab (optional).
	 * @returns {String}  A string in Netscape Bookmarks File Format.
	 */
	JSONToNetscape(json, tabSpaces = 4, header = true) {
		let parentsArr = [json]
		let child = null
		let childIndex = null
		let childrenArr = null

		let tabNum = parentsArr.length
		let netscapeStr = ''
		if (header) netscapeStr = this.netscapeHeader + '\n<DL><p>'

		while (tabNum) {
			if (!childIndex && !childrenArr) {
				childrenArr = parentsArr[parentsArr.length - 1].children

				if (child) childIndex = childrenArr.indexOf(child) + 1
				else childIndex = 0
			}

			if ((child = childrenArr[childIndex])) {
				netscapeStr += this.returnAsElementString(child, tabNum, tabSpaces)

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
	},

	returnAsElementString(jsonNode, tabNum, tabSpaces) {
		let title = 'Unnamed'
		const newlineIndent = '\n' + ' '.repeat(tabNum * tabSpaces)

		// TO DO: make attributes optional when setting up the parser
		if (this.attr_prop) {
			var attributes = ''
			for (const prop in jsonNode) {
				for (const attr in this.attr_prop) {
					attributes +=
						prop === this.attr_prop[attr]
							? ` ${attr}="${jsonNode[prop]}"`
							: ''
				}
			}
		}

		if (jsonNode.children) {
			return `${newlineIndent}<DT><H3${attributes}>${
				jsonNode[this.nodeTitleProperty]
			}</H3>${newlineIndent}<DL><p>`
		} else {
			return `${newlineIndent}<DT><A${attributes}>${
				jsonNode[this.nodeTitleProperty]
			}</A>`
		}
	},
}

export default netscapeConverter
