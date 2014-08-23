/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */

var fs = require("fs"),
	deep = require("deepjs"),
	marked = require("../../index"),
	cache = require("deepjs/lib/cache"),
	store =  require("deepjs/lib/restful/store");
	
deep.marked.clients = deep.marked.clients || {};
deep.marked.clients.Nodejs = deep.compose.Classes(deep.Store, function(protocol, basePath, options) {
	this.basePath = basePath || this.basePath || "";
	if (options)
		deep.utils.up(options, this);
	this.watched = this.watched || {};
}, {
	responseParser: function(datas, path) {
		if (datas instanceof Buffer)
			datas = datas.toString("utf8");
		var res = marked.compile(datas, marked.opt);
		return res;
	},
	get: function(path, options) {
		options = options || {};
		path = (deep.Promise.context.rootPath ||  deep.globals.rootPath || "") + this.basePath + path;
		var cacheName = (this.protocol||"marked::") + path;
		if (options.cache !== false)
		{
		 	var cached = cache.get(cacheName);
			if(cached)
				return cached;
		}
		var prom = new deep.Promise(),
			self = this;
		if (!this.watched[path])
			this.watched[path] = fs.watch(path, function(event, filename) {
				switch (event) {
					case 'change':
						//console.log("deep swig : changes detected : reload")
						fs.readFile(path, function(err, datas) {
							var d = null;
							if (err)
								d = deep.when(deep.errors.Watch("Error while reloading file : " + path));
							else
								d = deep.when(self.responseParser(datas, path));
							cache.manage(d, cacheName);
						});
						break;
					case 'rename':
						cache.remove(cacheName);
						break;
				}
			});
		fs.readFile(path, function(err, datas) {
			if (err)
				return prom.reject(err);
			prom.resolve(self.responseParser(datas, path));
		});
		if (options.cache !== false)
			cache.add(prom, cacheName);
		return prom;
	}
});

deep.marked.Nodejs = function(protocol, basePath, options) {
	if (typeof protocol === 'undefined')
		protocol = "marked";
	return new deep.marked.clients.Nodejs(protocol, basePath, options);
};
return deep.marked.Nodejs;

module.exports = deep.marked.clients.Nodejs;
