var browserify = require('browserify'),
    watchify = require('watchify'),
    gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    sourceFile = './resources/js/main.js',
    destFolder = './public/js/',
    destFile = 'game.js';


gulp.task('copy', function() {
  gulp.src('./node_modules/phaser/dist/phaser.min.js')
  .pipe(gulp.dest('./public/js/'));
});

gulp.task('browserify', function() {
  return browserify(sourceFile)
  .bundle()
  .pipe(source(destFile))
  .pipe(gulp.dest(destFolder));
});

gulp.task('watch', function() {

  var bundler = browserify(sourceFile).plugin(watchify);
  bundler.on('update', rebundle);

  function rebundle() {
    return bundler.bundle()
      .pipe(source(destFile))
      .pipe(gulp.dest(destFolder));
  }

  return rebundle();
});

gulp.task('default', ['copy', 'browserify', 'watch']);
