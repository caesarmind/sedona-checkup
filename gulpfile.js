import gulp from 'gulp';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import stylelint from 'stylelint';
import bemlinter from 'gulp-html-bemlinter';
import scssSyntax from 'postcss-scss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import { htmlValidator } from 'gulp-w3c-html-validator';
import webp from 'gulp-webp';
import htmlmin from 'gulp-htmlmin';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import gulpEsbuild from 'gulp-esbuild';
import imagemin from 'gulp-imagemin';
import { deleteAsync } from 'del';
import { stacksvg } from "gulp-stacksvg"
import eslint from 'gulp-eslint';
import sortMediaQueries from 'postcss-sort-media-queries';
import replace from 'gulp-replace';
import gulpif from 'gulp-if';

const { src, dest, series, parallel, watch } = gulp;
const isDev = process.argv.includes('dev');
const isBuild = process.argv.includes('build');

const outputDir = isBuild ? 'build' : 'dev';


// Optimize Images - ONLY for build
export const optimizeImages = () => {
	return src('source/img/**/*.{jpg, png, svg}')
		.pipe(imagemin())
		.pipe(dest('build/img/'));
}

// Copy files - ONLY for build
export const copyStatic = (done) => {
	return(src([
		'source/static/**',
		'!source/static/pixelperfect/**'
	]))
		.pipe(dest('build/'))
		done();
}

export const copyFiles = (done) => {
	return(src([
		'source/img/**',
		'!source/img/icons/**'
	]))
		.pipe(dest('build/img'))
		done();
}

// HTML Minification - ONLY for build
export const minifyHtml = () => {
	return src('source/*.html')
		.pipe(
			gulpif(isBuild, replace('css/style.css', 'css/style.min.css')))
		.pipe(
			gulpif(isBuild, replace('scripts/index.js', 'scripts/index.min.js')))
		.pipe(
			gulpif(isBuild, replace(/\s*<script>.*pixelperfect.*\.js"><\/script>/s, '')))
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(dest(`build`))
}

// JS Minification and bundling - ONLY for build
export const minifyJs = () => {
	return src('source/scripts/index.js')
		.pipe(gulpEsbuild({
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
		.pipe(stacksvg({ output: 'sprite'}))
		.pipe(dest(`${outputDir}/img`));
}

// Convert to WebP
export const createWebp = () => {
	return src("source/img/**/*.{png,jpg}")
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



// Watcher
export const watcher = () => {
	watch('source/sass/**/*.scss', parallel(compileSass, lintStyles));
	watch('source/scripts/**/*.js', series(lintJs, reload));
	watch('source/**/*.html').on('change', series(validateMarkup, lintBem, reload));
	watch('source/sprite/*.svg').on('all', series(stackSvg, reload));
};


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
	done()
}

// build
export const build = series(
	clean,
	copyStatic,
	copyFiles,
	optimizeImages,
	parallel(
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
		createWebp,
	),
	gulp.series(
    server,
    watcher
  )
);

export const lint = parallel(validateMarkup, lintBem, lintStyles, lintJs);

//Default
export default dev;
