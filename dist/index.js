"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = pegasusLoader;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _loaderUtils = require("loader-utils");

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

function pegasusLoader(source) {
  var _this = this;

  var callback = this.async();
  var isSync = "function" !== typeof callback;
  var finalCallback = callback || this.callback;

  var basePath = this.context;

  var buildRouteForDirectory = function buildRouteForDirectory(directory, parentDirectoryPath) {
    var route = {
      component: null,
      path: null,
      childRoutes: [],
      dynamicRoutes: []
    };

    var directoryItems = _fs2["default"].readdirSync(directory);

    var indexOfRouteComponent = directoryItems.indexOf("index.js");

    // evaluate the route component first to set up parent paths
    if (indexOfRouteComponent >= 0) {
      var fullPath = directory + "/index.js";

      directoryItems.splice(indexOfRouteComponent, 1);

      console.log("FULL PATH", fullPath);
      _this.dependency(fullPath);

      route.component = fullPath;

      var path = undefined;

      if (parentDirectoryPath) {
        path = directory.replace(parentDirectoryPath, "");
      } else {
        path = directory.replace(basePath, "");
      }

      // all react-router paths are absolute
      if (path === "") {
        path = "/";
      } else {
        // simply replace @ with : for dynamic segments in react-router
        path = path.replace(/@/g, ":");
      }

      // this is now the parent route path of any child routes processed later
      parentDirectoryPath = directory + "/";

      console.log("PATH", path);

      route.path = path;
    }

    directoryItems.forEach(function (file) {
      var fullPath = directory + "/" + file;

      if (file !== "node_modules" && file !== ".git") {
        if (_fs2["default"].statSync(fullPath).isDirectory()) {
          console.log("PARENT PATH", parentDirectoryPath);

          var childRoute = buildRouteForDirectory(fullPath, parentDirectoryPath);

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
      // evaluate static routes first and dynamic segments last
      var childRoutes = [].concat(_toConsumableArray(route.childRoutes), _toConsumableArray(route.dynamicRoutes));

      // this is the only bit of code emitted to your application
      return "\n        {\n          getComponents: function(location, callback) {\n            require.ensure([], function(require) {\n              callback(null,\n                require(" + _loaderUtils2["default"].stringifyRequest(_this, route.component) + ")\n              );\n            });\n          }\n        , path: " + JSON.stringify(route.path) + "\n        , childRoutes: [" + childRoutes.join(",") + "]\n        }\n      ";
    } else {
      return null;
    }
  };

  var routes = buildRouteForDirectory(basePath);

  finalCallback(null, "module.exports = " + routes + ";");
}

module.exports = exports["default"];