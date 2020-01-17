gulp-cdn-origin-replace
================

> 替换html里面的js/css/image/data:image/cdn引用域名

## 安装
```
npm install gulp-cdn-origin-replace --save-dev
```

## 示例
### `gulpfile.js`
```js
var originReplace = require('gulp-cdn-origin-replace');

gulp.task('cdn', function() {
    return gulp.src('./src/*.html')
        .pipe(originReplace({
            js: '//js.cdn.cn',
            css: '//css.cdn.cn',
            special: {
                "www.baidu.com": "//github.com",
                ".": "//npmjs.com"
            }
        }))
        .pipe(gulp.dest('./dist'));
});
```
## 参数说明

### originReplace(options)

### options

Type: `Object`

#### options.js
Type: `String`

将js文件引用的 路径域名/相对路径 替换成设定的字符串

#### options.css
Type: `String`

将css文件引用的 路径域名/相对路径 替换成设定的字符串

#### options.image
Type: `String`

将image文件引用的 路径域名/相对路径 替换成设定的字符串

#### options.cssImg
Type: `String`

将base64文件引用的 路径域名/相对路径 替换成设定的字符串

#### options.special
Type: `Object`

特殊设定，当引用的路径和special中的配置匹配，以special的配置为准

#### options.inlineReplace
Type: `Boolean`
Default: `true`

Whether replace tag with `inline` attribute.

The CDN prefix for css files.