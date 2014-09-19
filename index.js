/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
 
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(["require", "kroked/index", "deepjs/deep"], 
function(require, kroked, deep){
	// expose trhough deep
	deep.marked = deep.kroked = kroked;
	return deep.marked;
});
