const netscapeParser = {
	itteration: 0,
	level: -1,

	positions: {
		lvlUp: 0,
		lvlDown: 0,
		targetStart: 0,
		targetEnd: 0,
	},

	tags: {
		DT: '<DT>',
		DLOpen: '<DL>',
		DLClose: '</DL>',
		targetOpeningTagsLength: 2,
		folderOpen: '<H',
		linkOpen: '<A',
		folderClose: '</H3>',
		linkClose: '</A>',
	},

	parseTree: null,

	/**
	 * Parses Netscape Bookmarks text file and returns a JSON parse tree.
	 * Optionaly pass midFunction which will get individual JSON nodes.
	 * @param {String} htmlString Netscape Bookmarks string to traverse
	 * @param {Function} midFunction Optional user defined function.
	 * 								 If not provided, the default function
	 * 								 will create a parse tree
	 * @returns {Promise} (Promise)
	 */
	parseFromString(htmlString, midFunction = this.createParseTree) {
		this.positions.lvlUp = htmlString.indexOf(this.tags.DLOpen)
		this.positions.lvlDown = htmlString.indexOf(this.tags.DLClose)

		return new Promise(async (resolve, reject) => {
			let tag = null
			let node = null

			while ((tag = this.getNextValidTag(htmlString))) {
				// node = returnAsObject(tag)
				// midFunction(node)
			}
			console.log(this.itteration)
			resolve(this.parseTree)
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
				this.tags.targetOpeningTagsLength
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
		}
		this.itteration++
		// console.log(this.itteration++)

		// console.log('Level: ', this.level)
		// console.log(tag)
		return tag
	},

	returnAsObject(bookmarkTag, level) {
		let bookmarkObj = {
			title: bookmarkTag.innerText,
			attributes: {},
			level: level,
			element: bookmarkTag,
		}

		if ((bookmarkObj.parentElement = this.findParentElement(bookmarkTag)))
			bookmarkObj.parentElement = bookmarkObj.parentElement.firstElementChild // <H1> or <H3>

		for (const attr of bookmarkTag.attributes)
			bookmarkObj.attributes[attr.name] = attr.value

		return bookmarkObj
	},

	createParseTree(node) {},

	/**
	 * Traverses bookmarks JSON object, converts every node to an element and
	 * populates the bookmarksDOM in JSON object structure order.
	 * @param {JSON} json JSON object
	 * @returns {String}  A string in Netscape Bookmarks File Format.
	 */
	parseFromJSON(json) {
		let child = null
		let childIndex = null
		let childrenArr = null
		let parentsArr = [json.children ? json : json[0]]

		let tabNum = parentsArr.length
		let netscapeStr = this.netscapeHeader + '\n<DL><p>'

		while (parentsArr.length) {
			if (!childIndex && !childrenArr) {
				childrenArr = parentsArr[parentsArr.length - 1].children

				if (child) childIndex = childrenArr.indexOf(child) + 1
				else childIndex = 0
			}

			if ((child = childrenArr[childIndex])) {
				netscapeStr += this.returnAsElementString(child, tabNum)

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
				netscapeStr +=
					'\n' + ' '.repeat(tabNum * this.tabSpaces) + '</DL><p>'
			}
		}

		return netscapeStr
	},

	returnAsElementString(jsonNode, tabNum) {
		const newlineIndent = '\n' + ' '.repeat(tabNum * this.tabSpaces)

		// TO DO: make attributes optional when setting up the parser
		if (this.tagAttrToNodeProp) {
			var attributes = ''
			for (const attr in this.tagAttrToNodeProp) {
				for (const prop in jsonNode) {
					attributes +=
						prop === this.tagAttrToNodeProp[attr]
							? ` ${attr}="${jsonNode[prop]}"`
							: ''
				}
			}
		}

		if (jsonNode.children) {
			return `${newlineIndent}<DT><H3${attributes}>${jsonNode.title}</H3>${newlineIndent}<DL><p>`
		} else {
			return `${newlineIndent}<DT><A${attributes}>${jsonNode.title}</A>`
		}
	},

	netscapeHeader: `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!--This is an automatically generated file.
    It will be read and overwritten.
    Do Not Edit! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<Title>Bookmarks</Title>
<H1>Bookmarks</H1>`,

	tagAttrToNodeProp: {
		ADD_DATE: 'dateAdded',
		LAST_VISIT: 'dateLastVisited',
		LAST_MODIFIED: 'dateGroupModified',
		PERSONAL_TOOLBAR_FOLDER: 'personalToolbarFolder',
		HREF: 'url',
		ICON: 'icon',
	},
	tabSpaces: 4,
}

export default netscapeParser
