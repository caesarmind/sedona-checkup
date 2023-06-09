import { deleteAsync } from 'del';
import { htmlValidator } from 'gulp-w3c-html-validator';
import { stacksvg } from 'gulp-stacksvg';
import autoprefixer from 'autoprefixer';
import bemlinter from 'gulp-html-bemlinter';
import browser from 'browser-sync';
import csso from 'postcss-csso';
import esbuild from 'gulp-esbuild';
import eslint from 'gulp-eslint';
import gulp from 'gulp';
import gulpif from 'gulp-if';
import htmlmin from 'gulp-htmlmin';
import imagemin from 'gulp-imagemin';
import mozjpeg from 'imagemin-mozjpeg';
import optipng from 'imagemin-optipng';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import sass from 'gulp-dart-sass';
import scssSyntax from 'postcss-scss';
import sortMediaQueries from 'postcss-sort-media-queries';
import stylelint from 'stylelint';
import svgo from 'imagemin-svgo';
import svgoConf from './svgo.config.js';
import webp from 'gulp-webp';

const { src, dest, series, parallel, watch } = gulp;
const isDev = process.argv.includes('dev');
const isBuild = process.argv.includes('build');

const outputDir = isBuild ? 'build' : 'dev';


// Optimize Images - ONLY for build
export const optimizeImages = () => {
	return src('source/img/**/*.{jpg, png, svg}')
		.pipe(imagemin([
			mozjpeg(),
			optipng(),
			svgo(svgoConf)
		]))
		.pipe(dest('build/img'));
}

// Copy files - ONLY for build
export const copyStatic = () => {
	return(src([
		'source/static/**',
		'!source/static/pixelperfect/**'
	]))
		.pipe(dest('build/'));
}

// HTML Minification - ONLY for build
export const minifyHtml = () => {
	return src('source/*.html')
		.pipe(
			gulpif(isBuild, replace(/(css\/)([\w.-]+)\.css/g, '$1$2.min.css'))) // renames *.css to *.min.css
		.pipe(
			gulpif(isBuild, replace('scripts/index.js', 'scripts/index.min.js')))
		.pipe(
			gulpif(isBuild, replace(/\s*<script>.*pixelperfect.*\.js"><\/script>/s, '')))
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(dest(`build`));
}

// JS Minification and bundling - ONLY for build
export const minifyJs = () => {
	return src('source/scripts/index.js')
		.pipe(esbuild({
			outfile: 'index.min.js',
			bundle: true,
			minify: true
		}))
		.pipe(dest(`build/scripts`));
}

// Removes builded files
export const clean = () => {
	return deleteAsync(`${outputDir}`);
}


// Compile SCSS files and minifies css
export const compileSass = () => {
	return src('source/sass/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss([
			autoprefixer(),
			sortMediaQueries()
			]))
		.pipe(gulpif(isBuild, postcss([
			csso()
		])))
		.pipe(gulpif(isBuild, rename('style.min.css')))
		.pipe(dest(`${outputDir}/css`))
		.pipe(browser.reload({ stream: true }));
}

// SVG Sprites
export const stackSvg = () => {
  return src('source/img/icons/**/*.svg')
    .pipe(imagemin([
      svgo(svgoConf) // Specify the plugin as a function call
    ]))

		// Ne poniatno pochemu ne rabotaet. Udali etot kod chtob uvidet.
    .on('error', function (err) {
      console.error('Error in gulp-imagemin:', err.message);
      this.emit('end'); // Continue the Gulp task even if there is an error
    })

		//
		.pipe(stacksvg({ output: 'sprite' }))
    .pipe(dest(`${outputDir}/img`));
};

// Convert to WebP
export const createWebp = () => {
	return src(isBuild ? "build/img/**/*.{png,jpg}" : "source/img/**/*.{png,jpg}")
		.pipe(webp({ quality: 90 }))
		.pipe(dest(`${outputDir}/img`));
};

/*** Linters */
// Linter for JS
export const lintJs = () => {
	return src('source/scripts/**/*.js')
		.pipe(eslint({ fix: false }))
		.pipe(eslint.format())
		.pipe(gulpif(isBuild, eslint.failAfterError()));
}


// Linter for SASS
const lintStyles = () => {
	return gulp
	.src('source/sass/**/*.scss')
	.pipe(
		postcss([stylelint()], { syntax: scssSyntax })
	)
}

// Linter for BEM
const lintBem = () => {
	return gulp
	.src('source/*.html')
	.pipe(bemlinter());
}

// HTML W3C Validator
const validateMarkup = () => {
	return gulp.src('source/*.html')
	.pipe(htmlValidator.analyzer())
	.pipe(htmlValidator.reporter({throwErrors: true}));
}
/*** */

// Reload
const reload = (done) => {
	browser.reload();
	done();
}

// Server
const server = (done) => {
	browser.init({
		server: {
			baseDir: ['source/static', 'dev', 'source'],
		},
		cors: true,
		ui: false,
		notify: false,
	});

	watch('source/sass/**/*.scss', parallel(compileSass, lintStyles));
	watch('source/scripts/*.js', series(lintJs, reload));
	watch('source/**/*.html').on('change', series(validateMarkup, lintBem, reload));
	watch('source/sprite/*.svg').on('all', series(stackSvg, reload));
}

// build
export const build = series(
	clean,
	optimizeImages,
	parallel(
		copyStatic,
		createWebp,
		stackSvg,
		compileSass,
		minifyHtml,
		minifyJs
	)
);

// dev
export const dev = series (
	clean,
	parallel(
		compileSass,
		stackSvg,
		createWebp
	),
	server
);

export const lint = parallel(validateMarkup, lintBem, lintStyles, lintJs);

//Default
export default dev;
