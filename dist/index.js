"use strict";

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _loaderUtils = require("loader-utils");

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

module.exports = function (source) {
  var _this = this;

  var callback = this.async();
  var isSync = "function" !== typeof callback;
  var finalCallback = callback || this.callback;

  var basePath = this.context;

  var buildRouteForDirectory = function buildRouteForDirectory(directory) {
    var route = {
      component: null,
      path: null,
      childRoutes: [],
      dynamicRoutes: []
    };

    _fs2.default.readdirSync(directory).forEach(function (file) {
      var fullPath = directory + "/" + file;

      if (file === "index.js") {
        _this.dependency(fullPath);

        route.component = fullPath;

        var path = directory.replace(basePath, "");

        // all react-router paths are absolute
        if (path === "") {
          path = "/";
        } else {
          // simply replace @ with : for dynamic segments in react-router
          path = path.replace(/@/g, ":");
        }

        route.path = path;
      } else if (file !== "node_modules" && file !== ".git") {
        if (_fs2.default.statSync(fullPath).isDirectory()) {
          var childRoute = buildRouteForDirectory(fullPath);

          if (childRoute) {
            if (file.startsWith("@")) {
              route.dynamicRoutes.push(childRoute);
            } else {
              route.childRoutes.push(childRoute);
            }
          }
        }
      }
    });

    if (route.component && route.path) {
      var childRoutes = [].concat(_toConsumableArray(route.childRoutes), _toConsumableArray(route.dynamicRoutes));

      return "\n        {\n          getComponents: function(location, callback) {\n            require.ensure([], function(require) {\n              callback(null,\n                require(" + _loaderUtils2.default.stringifyRequest(_this, route.component) + ").default\n              );\n            });\n          }\n        , path: " + JSON.stringify(route.path) + "\n        , childRoutes: [" + childRoutes.join(",") + "]\n        }\n      ";
    } else {
      return null;
    }
  };

  var routes = buildRouteForDirectory(basePath);

  finalCallback(null, "module.exports = " + routes + ";");
};