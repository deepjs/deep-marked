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
		context:function(args, content, options){
			var content = args[0], toRem = trimSpace.exec(content)[0].length;
			content = content.substring(0, content.length-toRem);
			if(options.context)
				return deep.utils.fromPath(options.context, content);
			return '[(replaced)' + content + ']';
		}
	};
});