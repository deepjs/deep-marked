/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
 
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(["require", "./lib/marked", "deepjs/deep", "deep-views/lib/directives-parser", "./lib/directives"], function(require, marked, deep, directivesParser, directives){

	var renderer = new marked.Renderer();
	//_________________________________________________________________________ BLOCK MACRO 
	renderer.block_macro = function(directives, content, options) {
		// console.log("render block macro : ", directives, content);
		//var res = (typeof content === 'undefined')?"":content;
		var res = (!content && content !== "")?"":content;
		for(var i = directives.length; --i >= 0;)
		{
			var dir = directives[i];
			var mcr = deep.marked.getDirectives(dir.name, "block");
			if(!mcr)
				res = deep.marked.directives.blockDefault(dir, res);
			else
				res = mcr(dir.args, res, options);
		}
		return res;
	};
	//________________________________________________________________________ DIRECT MACRO
	renderer.inline_macro = function(directive, options) {
		var mcr = deep.marked.getDirectives(directive.name, "inline");
		if(!mcr)
			return deep.marked.directives.inlineDefault(directive);
		else
			return mcr(directive.args, options);
	};
	//_________________________________________________________________________ REPLACE MACRO 
	var trimSpace = /\s*$/;
	renderer.replace_macro = function(content, options) {
		var toRem = trimSpace.exec(content)[0].length;
		content = content.substring(0, content.length-toRem);
		if(options.context)
			return deep.utils.fromPath(options.context, content);
		return '[(replaced)' + content + ']';
	};
	//______________________________________________________________________________________

	// expose trhough deep
	deep.marked = function(src, opt){
		return marked(src, deep.marked.opt);
	};

	deep.marked.opt = {
	  renderer: renderer,
	  gfm: true,
	  tables: true,
	  breaks: false,
	  pedantic: false,
	  sanitize: false,
	  smartLists: true,
	  smartypants: false,
	  codespaces:false,
	  macros:true,
	  directivesParser:directivesParser
	};

	marked.setOptions(deep.marked.opt);

	deep.marked.compile = marked.compile;
	deep.marked.renderer = renderer;

	deep.utils.directivesParser = directivesParser;

	deep.marked.directives = directives;
	deep.marked.getDirectives = function(name, type){
		var dir = deep.marked.directives[name];
		if(!dir)
			return null;
		if(deep.utils.isFunction(dir))
			return dir;
		return dir[type] || null;
	};
	deep.marked.setOptions = function(opt){
		marked.setOptions(opt);
	};
	var cellDelimitter = /^([^\n]+?)(?=\s{4,}|\n)(?:(\s{4,})?)/;

	/**
	 * Parse tab delimitted lines from string. usefull for raw macros and table like widgets rendering.
	 * @param  {String} src        the content block to parse until the end.
	 * @param  {Boolean} skipBlanck optional. if true, skip blank lines.
	 * @return {Array}            Parsed lines. Array of cells array. i.e. lines[2][3] gives you third cell of second line.
	 */
	deep.marked.parseLinesCells = function(src, skipBlanck){
		var tokens = [], cells, cap;
		while(src)
		{
			cells = [];
			while(cap = cellDelimitter.exec(src))
			{
				src = src.substring(cap[0].length);
				cells.push(cap[1]);
			}
			if(cells.length || !skipBlanck)
				tokens.push(cells);
			// src should start now with \n or \r
			src = src.substring(1);
		}
		return tokens;
	}

	return deep.marked;
});