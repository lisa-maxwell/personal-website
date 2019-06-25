/* 
   This gulp script will rebuild the theme .css file(s) using the
   SASS theme.scss file located in the `\sass` folder

   To use this gulpfile you must have NPM installed. Then run:
   
   > npm install --save-dev
   > gulp  

*/

var gulp = require('gulp'),
    fs = require('fs'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    mergeStream = require('merge-stream');

var sassPath = __dirname + "/../sass";
var cssPath = "../css/";

gulp.task('sass', function () {
    /* generates .css for each folder in sass/custom containing colors.scss */
    var themes = fs.readdirSync(sassPath+'/custom/').filter(f => fs.statSync(sassPath+'/custom/'+f).isDirectory());
    console.log('Found ' + themes.length + ' color themes...');
    var tasks = [];
    for (var t in themes) {
        var theme = themes[t];
        tasks.push(
            gulp.src(sassPath+'/custom/bootstrap-custom.scss')
                .pipe(sass({
                    includePaths: [sassPath+'/custom/'+theme,sassPath+'/bootstrap']
                }).on('error', function(e){console.log("sass error:"+e)}))
                .pipe(concat('theme-'+theme+'.css'))
                .pipe(gulp.dest(cssPath))
            );
    }
    return mergeStream(tasks);
});

gulp.task('defaultTheme', ['sass'], function(){
    /* copy the default theme to bootstrap-custom.css */
    fs.createReadStream(cssPath+'bootstrap-custom-default.css').pipe(fs.createWriteStream(cssPath+'bootstrap-custom.css'));
});

gulp.task('default',['sass','defaultTheme']);