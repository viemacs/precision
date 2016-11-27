'use strict';

var fs = require('fs');

(function() {
    var util = require('util');

    var log_file = fs.createWriteStream('./node_console.log', {flags: 'w'}); // __dirname
    log_file.write(util.format(d) + '\n');

    process.stdout.write(util.format(d) + '\n');
});

var url = require('url'),
    http = require('http'),
    path = require('path'),
    colors = require('colors');

exports = module.exports = createApplication;

function createApplication() {
    var app = {
        _on: {}, // not a http method
        _get: {},
        _put: {},
        _del: {}, // http method DELETE
        _post: {},
        _search: {},

        on: function(path, callback) {
            if (typeof callback != 'function')
                return console.error(('Precision.on[' + path + ']: '+ callback + ' is not a function').red);
            this._on[path] = this._on[path] || [];
            this._on[path].push(callback);
        },

        get: function(path, callback) {
            this._get[path] = this._get[path] || [];
            this._get[path].push(callback);
        },

        put: function(path, callback) {
            this._put[path] = this._put[path] || [];
            this._put[path].push(callback);
        },

        del: function(path, callback) {
            this._del[path] = this._del[path] || [];
            this._del[path].push(callback);
        },

        post: function(path, callback) {
            this._post[path] = this._post[path] || [];
            this._post[path].push(callback);
        },

        search: function(path, callback) {
            this._search[path] = this._search[path] || [];
            this._search[path].push(callback);
        },

        listen: function start_server(port, callback) {
            var server = http.createServer( (req, res) => { // require listener ^
                req.url = path.normalize(url.parse(req.url).pathname);
                if (req.url.length > 1 && req.url[req.url.length - 1] == '/')
                    req.url = req.url.substring(0, req.url.length - 1);

                var path_segments = req.url.split('/');
//              for (var i=0; i < path_segments.length; ) // '/'.split('/') -> ['', '']
                for (var i=1; i < path_segments.length; ) // '/'.split('/') -> ['', '']
                    path_segments[i] === '' && path_segments.splice(i, 1) || ++i;

                var path_first = '/' + path_segments[1];
                var pathname = req.url;

                switch (req.method.toLowerCase()) {
                case 'get':
                    for (var key in this._get)
                        if (pathname.match('^' + key + '$'))
                            this._get[key].forEach( (fn) => fn(req, res) );
                    break;

                case 'put':
                    for (var key in this._put)
                        if (pathname.match('^' + key + '$'))
                            this._put[key].forEach( (fn) => fn(req, res) );
                    break;

                case 'delete':
                    for (var key in this._del)
                        if (pathname.match('^' + key + '$'))
                            this._del[key].forEach( (fn) => fn(req, res) );
                    break;

                case 'post':
                    for (var key in this._post)
                        if (pathname.match('^' + key + '$'))
                            this._post[key].forEach( (fn) => fn(req, res) );
                    break;

                case 'search':
                    for (var key in this._search)
                        if (pathname.match('^' + key + '$'))
                            this._search[key].forEach( (fn) => fn(req, res) );
                    break;
                }

                if (this._on[path_first])
                    this._on[path_first].forEach( (fn) => fn(req, res) );
            });

            server.listen(port); // request listener $

            var host = server.address().address,
                port = server.address().port;
            var dt = new Date();
            console.log('[%s] Precision server started at http://%s:%s', dt.toISOString(), host, port);

            callback && callback(req, res);

            return server;
        },
    };

    app.on('error', error);

    return app;
}
