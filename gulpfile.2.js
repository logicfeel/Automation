var util = require('util');

var gulp            = require('gulp');

var Undertaker = require('undertaker');
var DefaultRegistry = require('undertaker-registry');

// Some task defined somewhere else
// var BuildRegistry = require('./build.js');
// var ServeRegistry = require('./serve.js');

function ConfigRegistry(config){
  DefaultRegistry.call(this);
  this.config = config;
}

util.inherits(ConfigRegistry, DefaultRegistry);

ConfigRegistry.prototype.set = function set(name, fn) {
  // The `DefaultRegistry` uses `this._tasks` for storage.
  var task = this._tasks[name] = fn.bind(this.config);
  return task;
};

ConfigRegistry.prototype.get = function get(name) {
    return this._tasks[name];
  };

var taker = new Undertaker();

// taker.registry(new BuildRegistry());
// taker.registry(new ServeRegistry());

// `taker.registry` will reset each task in the registry with
// `ConfigRegistry.prototype.set` which will bind them to the config object.
taker.registry(new ConfigRegistry({
  src: './src',
  build: './build',
  bindTo: '0.0.0.0:8888'
}));

taker.task('default', 
    taker.series(function(cb) {
        console.log('Server bind to ' + this.bindTo);
        console.log('Serving' + this.build);
        cb();
}.bind({
    src: './src',
    build: './build',
    bindTo: '0.0.0.0:8888'
  })));

// taker.series('default')();


gulp.registry(taker._registry);