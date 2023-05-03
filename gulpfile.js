import gulp from 'gulp';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import stylelint from 'stylelint';
import bemlinter from 'gulp-html-bemlinter';
import scssSyntax from 'postcss-scss';
import browser from 'browser-sync';
import { htmlValidator } from 'gulp-w3c-html-validator';

// Server
const server = (done) => {
	browser.init({
		server: {
			baseDir: ['source', 'source/static'],
		},
		cors: true,
		ui: false,
		notify: false,
	});
	done()
}

//Compile SCSS files
const compileSass = () => {
	return gulp
		.src('source/sass/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('source/css'))
		.pipe(browser.reload({ stream: true }));
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
	return gulp
	.src('source/*.html')
	.pipe(htmlValidator.analyzer())
	.pipe(htmlValidator.reporter({throwErrors: true}));
}

// Watcher
const watcher = () => {
	gulp.watch('source/sass/**/*.scss', gulp.parallel(compileSass, lintStyles));
	gulp.watch('source/**/*.html', gulp.parallel(validateMarkup, lintBem, browser.reload));
};

const lint = gulp.series(validateMarkup, lintBem, lintStyles);

export { validateMarkup, lintBem, lintStyles, lint };
//Default
export default gulp.series(server, watcher);
