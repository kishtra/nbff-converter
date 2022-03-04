const globals = {
	nodeNum: 0,

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
}

export default globals
