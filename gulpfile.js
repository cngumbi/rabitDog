//development
const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const cleanCSS =  require('gulp-clean-css');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const { deleteAsync } = require('del');

const paths = {
    styles: {
        src: "frontend/src/style/index.scss",
        watch: "frontend/src/style/**/*.scss",
        dest: "frontend/src/style/css"
    }
};
/**
 * clean CSS output Directory
 **/
async function clean(){
    await deleteAsync([
        `${paths.styles.dest}/**/*`,
    ]);
}
/**
 * Development build
 */
function buildDev() {
    return src(paths.styles.src)
        .pipe(
            plumber({
                errorHandler: notify.onError({
                    title: "SASS Error",
                    message: "<%= error.message %>"
                })
            })
        )
        .pipe(sourcemaps.init())
        .pipe(
            sass({
                includePaths: ["frontend/src/style"]
            }).on('error', sass.logError)
        )
        .pipe(
            postcss([
                autoprefixer()
            ])
        )
        .pipe(sourcemaps.write('.'))
        .pipe(dest('frontend/src/style/css'))
}
/**
 * Production Build
 */
function buildProd(){
    return src(paths.styles.src)
        .pipe(plumber())
        .pipe(
            sass({
                includePaths: ["frontend/src/style"],
            }).on('error', sass.logError)
        )
        .pipe(
            postcss([
                autoprefixer(),
            ])
        )
        .pipe(dest(paths.styles.dest))
        .pipe(
            postcss([
                cssnano({
                    preset: 'default'
                })
            ])
        )
        .pipe(rename({ suffix: '.min'}))
        .pipe(dest(paths.styles.dest))
}
/**
 * Watch task
 */
function liveTask() {
    watch(paths.styles.watch, series(buildProd));
}
/**
 * Public Task
 */
exports.clean = clean;
exports.dev = series(clean, buildDev);
exports.build = series(clean, buildProd);
exports.watch = series(clean, buildProd, liveTask);
exports.default = exports.watch;