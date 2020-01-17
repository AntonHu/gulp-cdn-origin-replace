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
 * option: { js, css, image, cssImage, include, exclude }
 * include {Object} 需要特殊处理的cdn，正则匹配url
 * exclude {Array} 排除cdn，不进行替换，正则匹配url
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
            // include处理
            if ( option.include ) {
                for ( var key in option.include ) {
                    new RegExp(key).test(url) && (prefix = option.include[key] || '');
                }
            }
            prefix && (prefix[prefix.length - 1] === '/' || (prefix += '/'));
        }

        var newPath = [];
        for ( var i = 0; i < paths.length; i++ ) {
            // 去掉域名或相对路径
            i !== 0 && paths[i] !== '.' && paths[i] !== '..' && newPath.push(paths[i])
        }

        return prefix + newPath.join('/');
    }

    return through.obj(function(file, enc, fn) {
        if (file.isNull()) return fn(null, file);

        if (file.isStream()) return fn(new gutil.PluginError('gulp-cdn-replace', 'Streaming is not supported'));

        // Buffer
        var contents = file.contents.toString();
        var inlineReplace = option.inlineReplace;
        // default is true
        'undefined' === typeof inlineReplace && (inlineReplace = true);

        var isExclude = function(excludeArr, str) {
            for ( var i = 0; i < excludeArr.length; i++ ) {
                if (new RegExp(excludeArr[i]).test(str)) {
                    return true;
                }
            }
        }

        contents = contents.replace(jsReg, function(match, url) {
                if ( !(option.exclude && isExclude(option.exclude, url)) ) {
                    isHTTP(url) && (url = handlerHTTP(url));
                    match = match.replace(/src\s*=\s*["|']([^"'>]+)["|']/, 'src="' + getNewUrl(url, 'js', !inlineReplace && inlineReg.test(match)) + '"');
                }
                return match;
            })
            .replace(imageReg, function(match, url) {
                if ( !(option.exclude && isExclude(option.exclude, url)) ) {
                    isHTTP(url) && (url = handlerHTTP(url));
                    match = match.replace(/src\s*=\s*["|']([^"'>]+)["|']/, 'src="' + getNewUrl(url, 'image', !inlineReplace && inlineReg.test(match)) + '"');
                }
                return match;
            })
            .replace(cssReg, function(match, url) {
                if ( !(option.exclude && isExclude(option.exclude, url)) ) {
                    isHTTP(url) && (url = handlerHTTP(url));
                    (isCss(match) && (match = match.replace(/href\s*=\s*["|']([^"']+)["|']/, 'href="' + getNewUrl(url, 'css', !inlineReplace && inlineReg.test(match)) + '"')));
                }
                return match;
            })
            .replace(imgReg, function(match, url) {
                if ( !(option.exclude && isExclude(option.exclude, url)) ) {
                    isHTTP(url) && (url = handlerHTTP(url));
                    isBase64(url) || (match = match.replace(/url\s*\(\s*['|"]?([^'")]+)['|"]?\s*\)/, 'url(' + getNewUrl(url, 'cssImg', false) + ')'));
                }
                return match;
            });

        file.contents = new Buffer(contents);
        this.push(file);

        fn(null);
    });
};