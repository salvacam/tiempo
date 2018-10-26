/* File: gulpfile.js */

var gulp  = require('gulp');
var gutil = require('gulp-util');
let uglifyEs = require('gulp-uglify-es').default;

//var minifyCSS = require('gulp-minify-css');

var concat = require('gulp-concat');

/*
gulp.task('minifyCSS', function() {
	gutil.log('Gulp is minify CSS!');

	gulp.src(['!./css/style.min.css', '!./css/font-awesome.min.css', '!./css/bootstrap.min.css', './css/*.css'])
    	.pipe(minifyCSS({keepSpecialComments : 0}))
    	.pipe(concat('style.min.css'))
    	.pipe(gulp.dest('./css/'));
});
*/

gulp.task('minifyJS', function () {
    return gulp.src('./js/main_max.js')
    .pipe(uglifyEs().on('error', function(e){
            console.log(e);
            gutil.log('Gulp error!');
         }))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./js'))
});


// create a default task and just log a message
gulp.task('default',['minifyJS'], function() {
  gutil.log('Gulp is running!');
});