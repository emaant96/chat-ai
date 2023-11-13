const esbuild = require('esbuild');
const {exec} = require('child_process');
const sass = require('sass');
const postcss = require('postcss');
const fs = require('fs');
const chokidar = require('chokidar');


const watch = process.argv.includes('-w');

function getBuildOptions(more = {}) {
    const options = {
        color: true,
        logLevel: 'error',
        entryPoints: ['src/index.ts', "src/service-worker.ts", "src/content-script.ts"],
        tsconfig: './tsconfig.json',
        bundle: true,
        sourcemap: true
    };
    return {...options, ...more};
}

async function build(options) {
    const ctx = await esbuild.context(getBuildOptions(options)).catch((err) => console.error(err));
    if (watch) {
        await ctx.watch().then(() => console.log('watching...'));
    } else {
        await ctx.rebuild()
        console.log('build done');
    }
}

build({
    outdir: 'dist',
    platform: 'node'
});


function buildSCSS() {
    let result = sass.renderSync({
        file: 'src/assets/styles.scss',
        sourceMap: false,
        outputStyle: 'compressed'
    });
    console.log('SCSS compiled');

    let css = result.css.toString();

    fs.mkdirSync('dist/assets', {recursive: true});

    postcss([
        require('postcss-import'),
        require('tailwindcss'),
        require('autoprefixer'),
        require('postcss-nested'),
        require('cssnano')
    ])
        .process(css, {from: 'src/assets/styles.scss', to: 'dist/assets/styles.css'})
        .then((result) => {
            fs.writeFileSync('dist/assets/styles.css', result.css, (err) => {
                if (err) throw err;
                console.log('CSS optimized');
            });
        });
}

// One-liner for current directory
chokidar.watch(['./src/**/*.scss', './src/**/*.html']).on('all', (event, path) => {
    console.log(event, path);
    buildSCSS();
    exec('npm run copy-files');
    exec('npm run copy-manifest');
});
buildSCSS();
