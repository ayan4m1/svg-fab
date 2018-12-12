import del from 'del';
import gulp from 'gulp';
import babel from 'gulp-babel';

const src = './src/**/*.js';
const dst = './bin/';

const build = () =>
  gulp
    .src(src)
    .pipe(babel())
    .pipe(gulp.dest(dst));

const clean = () => del(`${dst}**/*.js`);
const watch = () => gulp.watch(src, build);

gulp.task('build', build);
gulp.task('clean', clean);
gulp.task('watch', gulp.series(build, watch));
gulp.task('default', gulp.series(clean, build));
