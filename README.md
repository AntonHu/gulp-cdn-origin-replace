gulp-cdn-origin-replace
================

> 替换html里面的js/css/image/data:image/cdn引用域名
> v0.0.3 新增参数的属性exclude，原属性special更名include，且改用正则匹配完整的cdn

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
            js: '//js.cdn.cn', // 所有script标签的js引用地址，域名替换为 //js.cdn.cn
            css: '//css.cdn.cn', // 所有link标签的css引用地址，域名替换为 //css.cdn.cn
            image: '//image.cdn.cn', // 所有img标签的图片引用地址，域名替换为 //image.cdn.cn
            cssImg: '//base64.cdn.cn', // 所有base64资源的引用地址，域名替换为 //base64.cdn.cn
            include: { // 包括以下匹配项
                "www.baidu.com": "//github.com"
            },
            exclude: [ // 排除以下匹配项
                "github.com",
                ".tsx"
            ]
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

#### options.include
Type: `Object`

在include里可以指定特殊处理的cdn，将采用正则匹配的逻辑，对符合规则的cdn进行指定的替换，优先级高于以上
##### 示例
```js
include: {
    "baidu": "//github.com" // 当cdn中含有 baidu ，将其域名替换为 //github.com
}
```

#### options.exclude
Type: `Array`

exclude可以指定一个排除在替换处理外的数组，能与数组中任一项匹配的cdn，都不会被替换，优先级最高
##### 示例
```js
// 当cdn中含有github/tsx的，都不会被替换域名
exclude: [
    "github",
    "tsx"
]
```

#### options.inlineReplace
Type: `Boolean`
Default: `true`

Whether replace tag with `inline` attribute.

The CDN prefix for css files.
