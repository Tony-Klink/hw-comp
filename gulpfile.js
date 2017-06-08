const gulp = require("gulp");
const del = require("del");
const merge = require("merge-stream");

gulp.task("clean:lib", function () {
    return del(["lib"]);
});

gulp.task("build:lib", function () {
    gulp.start("clean:lib");
    let js = gulp.src([ "./src/components/**/*.js", "!./src/components/index.js"])
                 .pipe(gulp.dest("lib"));

    let json = gulp.src([ "./src/components/**/*.json", "!./src/components/index.json"])
                 .pipe(gulp.dest("lib"));

    let css = gulp.src([ "./src/components/**/*.css", "!./src/components/index.css"])
                  .pipe(gulp.dest("lib"));

    return merge(js, css, json);
});

const intercept = require("gulp-intercept");
const gulpFile = require("gulp-file");
const path = require("path");

gulp.task("generate:index", function() {

    const re1 = /export\s*?{\s+(.+?)^[\sas\s]\s*?}/;
    const re2 = /export\s*?\s+(.+?)\s*?/;
    const re3 = /export\s*?{\s(.*?)\s*?as\s*?([^\s].*?)\s*?}/;

    let exportsContent = "";
    gulp.src(["./src/components/**/*.js", "!node_modules", "!build", "!lib", "!dist", "!docs"])
        .pipe(intercept(function(file) {

            if (file.contents && typeof file.contents.toString === "function")
            {
                let contents = file.contents.toString();
                let relativePath = path.relative(file.cwd + "/src/components", file.path);            
                let match = re1.exec(contents);
                if (match && match.length > 1)
                {
                    let exportString =  "export { " + match[1] + " } from \"./" + relativePath + "\";\n";
                    exportsContent += exportString;
                }
                
                match = re2.exec(contents);
                if (match && match.length > 1)
                {
                    let baseName = path.basename(relativePath).slice(0, -3);
                    let exportString = `import ${baseName} from './${relativePath}';\nexport default ${baseName};`;
                    exportsContent += exportString;
                }

                match = re3.exec(contents);
                if (match && match.length > 1)
                {
                    let baseName = path.basename(relativePath).slice(0, -3);
                    let exportString = "export { " + match[2] + " } from \"./" + relativePath + "\";\n";
                    exportsContent += exportString;
                } 
            }

            gulpFile("index.js", exportsContent)
                .pipe(gulp.dest("lib"));
            return file;
        }));
});