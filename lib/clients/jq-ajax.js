/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
 
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "../../index", "deepjs/lib/cache", "deep-restful/lib/store"], function(require, deep, marked, cache){
	deep.marked.clients = deep.marked.clients || {};
	deep.marked.clients.JQAjax = deep.compose.Classes(deep.Store, function(protocol, basePath, options) {
		this.basePath = basePath || this.basePath || "";
		if (options)
			deep.aup(options, this);
	}, {
		writeHeaders: function(req, headers) {
			for (var i in deep.globalHeaders)
				req.setRequestHeader(i, deep.globalHeaders[i]);
			for (i in this.headers)
				req.setRequestHeader(i, this.headers[i]);
			for (i in headers)
				req.setRequestHeader(i, headers[i]);
		},
		get: function(id, options) {
			options = options || {};
			id = this.basePath + id;
			var cacheName = (this.protocol||"marked::") + id;

			if (options.cache !== false)
			{
			 	var cached = cache.get(cacheName);
				if(cached)
					return cached;
			}
			var self = this;
			var prom = new deep.Promise();
			var promise = $.ajax({
				beforeSend: function(req) {
					self.writeHeaders(req, {
						"Accept": "text/plain; charset=utf-8"
					});
				},
				url: id,
				method: "GET"
			})
			.done(function(data, msg, jqXHR) {
				prom.resolve(data);
			})
			.fail(function() {
				prom.reject(deep.errors.Protocol("deep.marked.JQAjax failed : " + id + " - \n\n" + JSON.stringify(arguments)));
			});
			prom.done(function(data) {
				var resi = marked.compile(data, marked.opt);
				return resi;
			});
			if (options.cache !== false)
				cache.add(prom, cacheName);
			return prom;
		}
	});

	deep.marked.jqajax = function(protocol, basePath, options) {
		if (typeof protocol === 'undefined')
			protocol = "marked";
		return new deep.marked.clients.JQAjax(protocol, basePath, options);
	};
	return deep.marked.JQAjax;
});