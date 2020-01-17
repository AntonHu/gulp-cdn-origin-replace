'use strict';
var gutil = require('gulp-util');
var through = require('through2');

var jsReg = /<\s*script\s+.*src\s*=\s*["|']([^"']+)[^>]*><\s*\/\s*script\s*>/gim;
var cssReg = /<\s*link\s+.*href\s*=\s*["|']([^"']+)[^>]*>/gim;
var imageReg = /<\s*img\s+.*src\s*=\s*["|']([^"']+)[^>]*>/gim;
var imgReg = /url\s*\(\s*['|"]?([^'")]+)['|"]?\s*\)/gim;
var base64Reg = /^data:image\/([^;]+);base64,/;
var inlineReg = /\s+inline[\s+>]/;

var isCss = function(str) {
    if (!str) return false;
    return /rel\s*=\s*["|']stylesheet["|']/.test(String(str));
};
var isHTTP = function(str) {
    if (!str) return false;
    return /^(https?:)?\/\//.test(String(str));
};
var isBase64 = function(str) {
    if (!str) return false;
    return base64Reg.test(str);
};
/* 如果是域名，将路径中的协议头去掉 */
var handlerHTTP = function(str) {
    var delProtocol = str.slice(str.indexOf("//") + 2);
    return delProtocol;
};

/*
 * option: { js, css, image, cssImage, special }
 * special 需要特殊处理的cdn
*/
module.exports = function(option) {
    option = option || {};

    function getNewUrl(url, ext, inline) {
        var paths = url.split('/');

        ext = ext || filename.split('.').pop();

        // inline source
        var prefix = '';
        if(!inline) {
            prefix = option[ext] || '';
            // special处理
            if ( option.special ) {
                for ( var key in option.special ) {
                    key === paths[0] && (prefix = option.special[key] || '');
                }
            }
            prefix && (prefix[prefix.length - 1] === '/' || (prefix += '/'));
        }

        paths.shift(); // 去掉路径首项，一般为域名或相对路径，然后使用prefix代替原域名
        return prefix + paths.join('/');
    }

    return through.obj(function(file, enc, fn) {
        if (file.isNull()) return fn(null, file);

        if (file.isStream()) return fn(new gutil.PluginError('gulp-cdn-replace', 'Streaming is not supported'));

        // Buffer
        var contents = file.contents.toString();
        var inlineReplace = option.inlineReplace;
        // default is true
        'undefined' === typeof inlineReplace && (inlineReplace = true);

        contents = contents.replace(jsReg, function(match, url) {
                isHTTP(url) && (url = handlerHTTP(url));
                match = match.replace(/src\s*=\s*["|']([^"'>]+)["|']/, 'src="' + getNewUrl(url, 'js', !inlineReplace && inlineReg.test(match)) + '"');
                return match;
            })
            .replace(imageReg, function(match, url) {
                isHTTP(url) && (url = handlerHTTP(url));
                match = match.replace(/src\s*=\s*["|']([^"'>]+)["|']/, 'src="' + getNewUrl(url, 'image', !inlineReplace && inlineReg.test(match)) + '"');
                return match;
            })
            .replace(cssReg, function(match, url) {
                isHTTP(url) && (url = handlerHTTP(url));
                (isCss(match) && (match = match.replace(/href\s*=\s*["|']([^"']+)["|']/, 'href="' + getNewUrl(url, 'css', !inlineReplace && inlineReg.test(match)) + '"')));
                return match;
            })
            .replace(imgReg, function(match, url) {
                isHTTP(url) && (url = handlerHTTP(url));
                isBase64(url) || (match = match.replace(/url\s*\(\s*['|"]?([^'")]+)['|"]?\s*\)/, 'url(' + getNewUrl(url, 'cssImg', false) + ')'));
                return match;
            });

        file.contents = new Buffer(contents);
        this.push(file);

        fn(null);
    });
};
