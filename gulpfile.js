var browserify = require('browserify'),
    watchify = require('watchify'),
    gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    sourceFile = './resources/js/main.js',
    destFolder = './public/js/',
    destFile = 'game.js',
    sourcemaps = require('gulp-sourcemaps'),
    autoprefix = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    filter = require('gulp-filter'),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber');


gulp.task('styles', function () {

  // Process custom styles written in sass
  gulp.src('resources/sass/**/*.scss')
  .pipe(plumber())
  .pipe(sourcemaps.init())
  .pipe(sass({
    outputStyle: 'expanded',
    errLogToConsole: false,
    onError: function (err) {
      var splitErrMessage = err.message.split("\n"),
      errMessageLength = splitErrMessage.length,
      message =
      "Error compiling Sass." +
      "\n\t   File: " + err.file +
      "\n\t   Line: " + err.line +
      "\n\t   Message: " + splitErrMessage[0]
      ;

      // Some errors have a second part
      if (typeof splitErrMessage[1] !== 'undefined') {
        message += "\n\t   " + splitErrMessage[1];
      }

      // Some have even more (missing mixin for example where it'll privide a backtrace)
      if (errMessageLength > 2) {
        splitErrMessage.forEach(function (el, i) {
          if (i > 1) {
            message += "\n\t\t" + splitErrMessage[i].trim();
          }
        });
      }

      return notify().write(message);
    }
  }))
  .pipe(autoprefix())
  .pipe(rename({basename: 'all'})) // Rename the generated CSS file to add the .min suffix
  .pipe(gulp.dest('public/css'))
  .pipe(filter('*.css')) // Filter stream so we only get notifications and injections from CSS files, not the maps & so we don't minify the map file
  .pipe(rename({basename: 'all', suffix: ".min"})) // Rename the generated CSS file to add the .min suffix
  .pipe(minifycss({keepSpecialComments: 0}))
  .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '.'}))
  .pipe(gulp.dest('public/css'))
  .pipe(notify(function (file) {
    return 'Styles: ' + file.relative + ' generated.';
  }));

});

gulp.task('copy', function() {
  gulp.src('./node_modules/phaser/dist/phaser.min.js')
  .pipe(plumber())
  .pipe(gulp.dest('./public/js/'));
});

gulp.task('browserify', function() {
  return browserify(sourceFile)
  .bundle()
  .pipe(plumber())
  .pipe(source(destFile))
  .pipe(gulp.dest(destFolder));
});

gulp.task('watch', function() {

  gulp.watch(['resources/sass/**/*.scss'], ['styles']);

  var bundler = browserify(sourceFile).plugin(watchify);
  bundler.on('update', rebundle);

  function rebundle() {
    return bundler.bundle()
    .pipe(plumber())
    .pipe(source(destFile))
    .pipe(gulp.dest(destFolder));
  }

  return rebundle();
});

gulp.task('default', ['styles', 'copy', 'browserify', 'watch']);
