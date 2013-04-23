require('shelljs/make');
require('shelljs/global');

var fs      = require('fs')
  , path = require('path')
  , browserify = require('browserify')
  , UglifyJS = require("uglify-js")
  , less = require('less')
  ;

var buildPath = path.join(__dirname, 'build/socialfeed.js')
  , minifiedPath = path.join(__dirname, 'build/socialfeed.min.js');

target.all = function () {
  target.bundle(function () {
    target.less(function () {
      target.minify();
    });
  });
};

target.bundle = function (cb) {
  console.log('Bundle');
  bundleResources('src/moduletemplates/', 'src/resources.js');
  bundle(cb);
};

target.less = function (cb) {
  console.log('Compiling LESS');
  var data = cat('src/style.less');

  var parser = new(less.Parser)({
      paths: ['./src']
    , filename: 'style.less' 
  });

  parser.parse(data, function (e, tree) {
    var css = tree.toCSS()
      , minified = tree.toCSS({ compress: true });
    css.to('build/socialfeed.css');
    console.log('Minifing CSS');
    minified.to('build/socialfeed.min.css');
  });
};

target.minify = function () {
  console.log('Minifying...');
  UglifyJS.minify(buildPath).code.to(minifiedPath)
  console.log('Minfying succeeded.');
};

function getResourcesList (templateFolder) {
  var filenames = fs.readdirSync(path.join(__dirname, templateFolder));
  return filenames.map(function (file) {
    return file.replace('.html', '');
  });
}

function bundleResources (source, target) {
  var templates = getResourcesList(source);

  var resourceString = "";
  templates.forEach(function (template) {
    resourceString += '\t"'+template+'": ' + JSON.stringify(cat(source + template + '.html')) + ",\n";
  });

  cat('src/resources.js.template').replace(/%BODY%/g, resourceString).to(path.join(__dirname, target));
}

function bundle(cb) {
  cb = cb || function () {};

  browserify()
  .require(require.resolve('./src/socialfeed.js'), { entry: true })
  .bundle(function (err, src) {
    if (err) return console.error(err);

    src.to(buildPath);
    console.log('Build succeeded, open index.html to see the result.');
    cb();
  });
}



