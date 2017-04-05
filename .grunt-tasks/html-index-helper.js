module.exports = function(grunt){
	var fs = require("fs");
	var htmlParser = require("htmlparser2");
	var resultList = [];

	var props = grunt.file.readJSON('./.htmlindex');
	var propsBasePath = props.basePath || "";
	var propsOutPath = props.outPath || "";
	var propsLinkPath = props.linkPath || "";
	var propsExceptDirs = props.exceptDirs || {};

	var htmlInfo = function(html){
		var isTitleTag = false;
		var returnValue = {};
		var parser = new htmlParser.Parser({
			onopentag: function(name/*, attribs*/){
				if (name === "title") {
					isTitleTag = true;
				}
			},
			ontext: function(text){
				if (isTitleTag) {
					returnValue["title"] = text;
				}
			},
			onclosetag: function(tagname){
				if (tagname === "title") {
					isTitleTag = false;
				}
			}
		}, {decodeEntities: false});
		parser.write(html);
		parser.end();
		return returnValue;
	};

	var list = function(path){
		var result = {};
		var files = [];
		fs.readdirSync(propsBasePath + path).forEach(function(file){
			var pathFile = path + "/" + file;
			if (fs.lstatSync(propsBasePath + pathFile).isDirectory()) {
				var isValid = true;
				var curDir = pathFile.substring(1) + "/";
				propsExceptDirs.forEach(function(value){
					if (curDir.indexOf(value) === 0) isValid = false;
				});
				if (isValid) list(pathFile);
				else console.log("Bypassing directory: " + pathFile);
			} else {
				if (pathFile.substring(pathFile.length - 5) === ".html") {
					var info = htmlInfo(fs.readFileSync(propsBasePath + pathFile));
					files.push({pathname: propsLinkPath + path, filename: file, title: info.title});
				}
			}
		});
		if (files.length > 0) {
			result.path = path || "/";
			result.files = files;
			resultList.push(result);
		}
	};

	list("");
	//console.log(resultList);
	grunt.file.write(propsOutPath + "/index.json", JSON.stringify(resultList, null, 2));
};