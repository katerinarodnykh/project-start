"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber"); /* не позволяет ошибке на одном из этапов поломать всю сборку, напишет про ошибку  */
var del = require("del"); /* перед очередной сборкой предыдущая версия удаляется, del библиотека для node.js, которая позволяет удалять любой файл, папку */
var server = require("browser-sync").create(); /* магия обновления стилей в реальном времени без фактического обновления */
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso"); /* минификатор css */
var rename = require("gulp-rename"); /* переименовывает файлы (нужно для преобразования style.css в style.min.css */
var imagemin = require("gulp-imagemin"); /* оптимизатор изображений */
var webp = require("gulp-webp"); /* сохраняет изображения jpg,png в формате webp */
var uglify = require("gulp-uglify"); /* минификация js */
var svgstore = require("gulp-svgstore"); /* формирует спрайт svg из отдельных svg-файлов  */
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include"); /* для вставки блоков html,  <include src="build/img/sprite.svg"></include> */

gulp.task("clean", function() {
    return del("build");
});

gulp.task("images", function() {
    return gulp.src([
            "source/img/*.{png,jpg,jpeg}",
            "source/img/icon-*.svg"
        ])/* "**"/"*" - для поиска любых файлов с прописанным расширением в любой подпапке папки img */
        .pipe(imagemin([
            imagemin.optipng({optimizationLevel: 3}), /* безопасное сжатие */
            imagemin.jpegtran({progressive: true}), /* сразу видны очертания изображения, далее загружается детализация */
            imagemin.svgo()
        ]))
        .pipe(gulp.dest("build/img"));
});

gulp.task("webp", function () {
    return gulp.src("source/img/*.{png,jpg}")
        .pipe(webp({quality: 90})) /* 100 - максимальная степень сжатия */
        .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function () {
    return gulp.src("source/img/*.svg")
        .pipe(imagemin([
            imagemin.svgo()
        ]))
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest("build/img"));
});

gulp.task("js", function () {
    return gulp.src("source/js/*.js")
        .pipe(uglify())
        .pipe(gulp.dest("build/js"))
        .pipe(server.stream());
});

gulp.task("copy", function() {
    return gulp.src([
        "source/fonts/**/*.{woff,woff2}", /* указывается путь целиком */
        "source/img/*",
        "!source/img/*.{png,jpg}",
    ], {
        base: "source" /* базовая папка, скопированы будут элементы внутри неё, а не вся папка целиком */
    })
        .pipe(gulp.dest("build"));
});

gulp.task("style", function() {
    return gulp.src("source/less/style.less")
        .pipe(plumber())
        .pipe(less())
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(minify())
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest("build/css"))
        .pipe(server.stream()); /* браузер "подменяет" css файлы, если вносятся изменения в реальном времени  */
});

gulp.task("html", function () {
    return gulp.src("source/*.html")
        .pipe(posthtml([
            include()
        ]))
        .pipe(gulp.dest("build"));
});

gulp.task("serve", function() {
    server.init({
        server: "build/",
        notify: false,
        open: true,
        cors: true,
        ui: false
    });

    gulp.watch("source/less/**/*.less", gulp.series('style')); /* watcher встроенный  */
    gulp.watch("source/js/**/*.js", gulp.series('js'));
    gulp.watch("source/*.html", gulp.series('html'));
    gulp.watch("source/img/**/*");
});

gulp.task("build", gulp.series('clean', 'copy', gulp.parallel('style', 'images', 'sprite', 'webp', 'js', 'html')));