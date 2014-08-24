/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
 
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(["require", "./lib/marked", "deepjs/deep", "deep-views/lib/directives-parser", "./lib/macros"], function(require, marked, deep, directives, macros){

	var renderBlockTag = function(directive, content){
		return "<"+directive.name+">\n"+ content + "\n</"+directive.name+">"
	};
	var renderInlineTag = function(directive){
		var args = directive.args,
			content = (args && args.length)?args[args.length-1]:"";
		return "<"+directive.name+">"+ content + '</'+directive.name+'>'
	};
	var renderer = new marked.Renderer();
	//_________________________________________________________________________ BLOCK MACRO 
	renderer.block_macro = function(directives, content, options) {
		// console.log("render block macro : ", directives, content);
		//var res = (typeof content === 'undefined')?"":content;
		var res = (!content && content !== "")?"":content;
		for(var i = directives.length; --i >= 0;)
		{
			var dir = directives[i];
			var mcr = deep.marked.getMacro(dir.name, "block");
			if(!mcr)
				res = renderBlockTag(dir, res);
			else
				res = mcr(dir.args, res, options);
		}
		return res;
	};
	//________________________________________________________________________ DIRECT MACRO
	renderer.inline_macro = function(directive, options) {
		var mcr = deep.marked.getMacro(directive.name, "inline");
		if(!mcr)
			return renderInlineTag(directive);
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
	  directivesParser:directives
	};

	marked.setOptions(deep.marked.opt);

	deep.marked.compile = marked.compile;
	deep.marked.renderer = renderer;

	deep.utils.directives = directives;

	deep.marked.renderInlineTag = renderInlineTag;
	deep.marked.renderBlockTag = renderBlockTag;

	deep.marked.macros = macros;
	deep.marked.getMacro = function(name, type){
		var macro = deep.marked.macros[name];
		if(!macro)
			return null;
		if(deep.utils.isFunction(macro))
			return macro;
		return macro[type] || null;
	};
	deep.marked.setOptions = function(opt){
		marked.setOptions(opt);
	};

	return deep.marked;
});