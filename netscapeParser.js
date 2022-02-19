const netscapeParser = {
	bookmarksDOM: null,

	/**
	 * Converts "text/html" file to DOM and
	 * with it invokes traverseDOM function.
	 * @param {File} htmlFile Netscape text/html mimeType file to traverse
	 * @param {Function} midFunction Passed to traverseDOM method
	 * @returns {Promise} (Promise)
	 */
	async traversHTML(htmlFile, midFunction) {
		const reader = new FileReader()

		return new Promise((resolve, reject) => {
			reader.onerror = () => {
				reader.abort()
				reject(new DOMException('Problem reading imported file.'))
			}

			reader.onload = () => {
				const domParser = new DOMParser()

				this.bookmarksDOM = domParser.parseFromString(reader.result, 'text/html')

				const errorNode = this.bookmarksDOM.querySelector('parsererror')
				if (errorNode) {
					reject(new DOMException('Problem parsing imported file.'))
				} else {
					// start treversal
					resolve(this.traverseDOM(midFunction))
				}
			}

			reader.readAsText(htmlFile, 'utf-8')
		})
	},

	/**
	 * Converts <a>/<h3> element to an object and
	 * passes it to the midFunction as an argument.
	 * @param {Document} document
	 * @param {Function} midFunction
	 * @returns {String} ('EOT') - End Of Traversal
	 */
	async traverseDOM(midFunction) {
		let level = 0
		let element = this.bookmarksDOM.querySelector('dt')

		// <p> is surplus
		this.bookmarksDOM.querySelectorAll('p').forEach((tag) => tag.remove())

		while (level >= 0) {
			const child = element.firstElementChild
			if (child.tagName === 'H3') {
				const folderObj = this.returnAsObject(child, level)

				await midFunction(folderObj)

				if (
					child.nextElementSibling.tagName === 'DL' &&
					child.nextElementSibling.firstElementChild
				) {
					element = child.nextElementSibling.firstElementChild
					level++
					continue
				}
			} else if (child.tagName === 'A') {
				const linkObj = this.returnAsObject(child, level)

				await midFunction(linkObj)
			}

			// Climbing down the tree untill sibling parent element exists
			while (element && !element.nextElementSibling) {
				element = this.findParentElement(element)
				level--
			}

			if (element) element = element.nextElementSibling
		}

		return 'EOT'
	},

	returnAsObject(bookmarkElem, level) {
		let bookmarkObj = {
			title: bookmarkElem.innerText,
			attributes: {},
			level: level,
			element: bookmarkElem,
		}

		if ((bookmarkObj.parentElement = this.findParentElement(bookmarkElem)))
			bookmarkObj.parentElement = bookmarkObj.parentElement.firstElementChild // <H1> or <H3>

		for (const attr of bookmarkElem.attributes)
			bookmarkObj.attributes[attr.name] = attr.value

		return bookmarkObj
	},

	findParentElement(element) {
		while (
			(element = element.parentElement) &&
			element.tagName !== 'DT' &&
			element.tagName !== 'BODY'
		)
			continue

		return element && element.tagName === 'DT' ? element : null
	},

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
				netscapeStr += '\n' + ' '.repeat(tabNum * this.tabSpaces) + '</DL><p>'
			}
		}

		return netscapeStr
	},

	returnAsElementString(jsonNode, tabNum) {
		const newlineIndent = '\n' + ' '.repeat(tabNum * this.tabSpaces)

		// TO DO: make attributes optional when setting up the parser
		if (this.elementAttributes) {
			var attributes = ''
			for (const attr in this.elementAttributes) {
				for (const prop in jsonNode) {
					attributes +=
						prop === this.elementAttributes[attr]
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

	elementAttributes: {
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
