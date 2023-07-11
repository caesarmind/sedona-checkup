# caesarmind-sedona
Mentorship repository (HTML &amp; CSS, level2)

## Command List

- `npm install`: Use this command to install all the project dependencies before starting.
- `npm start`: This command starts the project in the development environment. You can interact with the code live, and changes will be automatically reflected in your browser.
- `npm test`: Run this command to execute lint tests for code quality.
- `npm run build`: Use this command to generate the final files and create the `build` directory, which contains the optimized and processed project files.

## Project Structure

- `build/`: This directory is created after running `npm run build`. It contains the final files of the project.
- `dev/`: During development with `npm start`, this directory is created to store files that require processing or optimization before being served.
- `source/`: The main source directory for original files.
  - `source/scripts/index.js`: This directory contains JavaScript files that use the ES module system. The `index.js` file is minified and bundled into a single file in the `build` directory.
  - `source/img/`: This directory is for background images, content images, and icons. All images undergo optimization during the build process.
    - `source/img/icons/`: Icons stored in this directory are converted into an SVG sprite during the project or build process.
  - `source/sass/`: SCSS stylesheets are stored in this directory. All stylesheets are minified and combined into a single file in the `build` directory.
    - `source/sass/global/`: Global styles specific to the project are stored in this directory.
    - `source/sass/blocks/`: BEM blocks have their individual directory in this folder.
	- `source/static/`: This directory is for static files such as images and files that don't require active processing during development. These files are served as they are without any modification.
  	- `source/static/fonts/`: Fonts used in the project are stored in this directory.
  	- `source/static/*.{ico,png,svg,webmanifest}`: This section includes favicon files in different formats and a web manifest configuration file. After generating the build, these files are moved to the root directory of the website.
- `source/pixelperfect/`: This directory contains screenshots used by the Pixel Perfect plugin.

## Development Environment Setup

To work in the development environment, follow these steps:

1. Run the `npm start` command to start the project and automatically open it in your browser.
   - This command sets up the development environment for you.

### Development Environment Structure

The development environment structure includes the following:

- **`dev/` Directory**: This directory is created during development for processing specific files.

Files that undergo processing:

- **`source/scss/` Directory**: SCSS files in this directory are compiled into CSS for browser usage.
  - *Note: In the development mode, the CSS files are not minified.*

- **`source/img/` Directory**: Images in this directory (excluding those in the `/icons/` subdirectory) are converted to WebP format.

- **`source/img/icons/` Directory**: Icons in this directory are used to generate the `sprite.svg` file.
  - The `sprite.svg` file contains all the icons combined into a single SVG sprite.

Other files used without processing:

- **`source/static/` Directory**: This directory contains files that are used as-is without any modifications during development.

- **`source/scripts/` Directory**: JavaScript files in this directory are used without any processing.

*Note: CSS, JS, and other files are not minified during the development mode.

## Generating Build

To generate the final build of the project, follow these steps:

1. Run the command `npm run build`.
   - This command triggers the build process to generate the optimized version of the project.

During the build process, the following optimizations are applied:

- **`source/img/` Directory**: All images in this directory (excluding those in the `/icons/` subdirectory) are compressed and converted to WebP format.
  - This optimization reduces image file sizes while maintaining visual quality.

- **`source/img/icons/` Directory**: All icons in this directory are combined into a single SVG sprite file named `sprite.svg`.
  - This consolidation simplifies the management and usage of icons in the project.

- **`source/sass/` Directory**: All SCSS files in this directory are compiled into a single CSS file.
  - During the compilation process, CSS files are prefixed to ensure cross-browser compatibility.
  - Media queries within the CSS are sorted for better organization.
  - The CSS file is minified to reduce its file size.
  - Note: An unminified version of the CSS file is also generated, but it is not linked to HTML files.

- **`source/scripts/modules/` Directory**: JavaScript files in this directory are bundled  into a single file named `index.js` and then minified.
  - This bundling process reduces the number of separate JavaScript files and improves performance.

- **`source/*.html` Files**: HTML files are minified during the build process.
  - Additionally, references to JavaScript and CSS files are updated to point to the minified versions with the 'min' suffix.

By executing the `npm run build` command, the final build of the project is generated, incorporating these optimizations.
