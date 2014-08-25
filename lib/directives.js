/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
 
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(["require", "deepjs/deep"], function(require, deep){
	var trimSpace = /\s*$/;
	return {
		blockDefault : function(directive, content){
			return "<"+directive.name+">"+ content + "</"+directive.name+">\n";
		},
		inlineDefault:function(directive){
			var args = directive.args,
				content = (args && args.length)?args[args.length-1]:"";
			return "<"+directive.name+">"+ content + '</'+directive.name+'>';
		},
		capitilize:{ 
			block:function(args, content, options)
			{
				return content.toUpperCase();
			},
			inline:function(args, options)
			{
				return args[0].toUpperCase();
			}
		},
		/* return value from context (same thing than substitution macros) */
		context:function(args, content, options){
			var content = args[0], toRem = trimSpace.exec(content)[0].length;
			content = content.substring(0, content.length-toRem);
			if(options.context)
				return deep.utils.fromPath(options.context, content);
			return '[(replaced)' + content + ']';
		},
		/* parse content as lines of tab (or 4 spaces) delimitted cells. (useful with raw macros) 
			@argument skipBlank	optional
			@return the array of line. each line is an array of cell. 

			@example
			{! lines-cells(true) 
			my first cell		my second cell		my third cell		...

			my first cell2		my second cell2		my third cell2		...
			!}

			==> will return you [["my first cell", "my second cell", ...], ["my first cell2", "my second cell2", ...]]
		*/
		"lines-cells":function(args, content, options)
		{
			return deep.marked.parseLinesCells(content, args[0]);
		},
		/* produce a table from raw macro content (lines of tab (or 4 spaces) delimitted cells) */
		table : function(args, content, options){
			var lines = deep.marked.parseLinesCells(content, false);
			var output = "<table>\n";
			if(args && args[0])	// args[0] === table caption
				output += "<caption>"+args[0]+"</caption>\n";
			lines.forEach(function(cells){
				if(!cells.length)
				{
					output += "<tr></tr>\n";
					return;
				}
				output += "<tr>\n";
				cells.forEach(function(cell){
					output += "<td>"+cell+"</td>";
				});
				output += "\n</tr>\n";
			})
			output  += "</table>\n";
			return output;
		}
	};
});