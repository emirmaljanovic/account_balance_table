const del = require('del');
const gulp = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const nodemon = require('gulp-nodemon');
const install = require('gulp-install');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');

const PATHS = {
    client: {
        base: './client/',
        scripts: './client/scripts/**/*.js',
        styles: './client/styles/**/*.scss',
        fonts: './client/fonts/**'
    },
    server: {
        base: './apiserver/',
        scripts: './apiserver/**/*.js',
        data: './apiserver/result.json'
    },
    dist: {
        base: './build',
        client: './build/client/',
        server: './build'
    }
};

gulp.task('watch', () => {
    gulp.watch(PATHS.client.styles, ['sass']);
    gulp.watch(PATHS.client.scripts, ['scripts']);
    gulp.watch(PATHS.client.base + 'index.html', ['copy_client']);
});

gulp.task('sass', () => {
    return gulp.src(PATHS.client.styles)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(PATHS.dist.client + 'styles/'));
});

gulp.task('scripts', () => {
    gulp.src(PATHS.client.scripts)
        .pipe(sourcemaps.init())
        // .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(PATHS.dist.client + 'scripts/'));
});

gulp.task('copy_client', ['copy_node_modules', 'copy_fonts'], () => {
    gulp.src(PATHS.client.base + 'index.html')
        .pipe(gulp.dest(PATHS.dist.client));
});

gulp.task('copy_fonts', () => {
    gulp.src(PATHS.client.fonts)
        .pipe(gulp.dest(PATHS.dist.client + 'fonts/'));
});

// Copy dependencies to build/node_modules/ 
gulp.task('copy_node_modules', () => {
    gulp.src('./package.json')
        .pipe(gulp.dest('./build'))
        .pipe(install({
            npm: '--production'
        }));
});

gulp.task('copy_server', () => {
    gulp.src([PATHS.server.base + '/**/*.js', PATHS.server.base + '/**/*.json'])
        .pipe(gulp.dest(PATHS.dist.server));
});

gulp.task('clean', () => {
    del(PATHS.dist.base);
});

gulp.task('build', ['sass', 'scripts', 'copy_client', 'copy_server']);

gulp.task('run', ['build'], () => {
    nodemon({
        script: 'server.js', 
        ext: 'js html', 
        cwd: 'build',
        watch: ['../' + PATHS.client.base, PATHS.server.base],
        env: { 'NODE_ENV': 'development' }
    })
    .on('restart', ['build']);
});

gulp.task('default', ['run']);