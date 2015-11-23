"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require("fs");

var _fs2 = _interopRequireWildcard(_fs);

exports["default"] = function (source) {
  var _this = this;

  var callback = this.async();
  var isSync = "function" !== typeof callback;
  var finalCallback = callback || this.callback;

  var basePath = this.context;

  var buildRouteForDirectory = (function (_buildRouteForDirectory) {
    function buildRouteForDirectory(_x) {
      return _buildRouteForDirectory.apply(this, arguments);
    }

    buildRouteForDirectory.toString = function () {
      return _buildRouteForDirectory.toString();
    };

    return buildRouteForDirectory;
  })(function (directory) {
    var route = {
      component: null,
      path: null,
      childRoutes: []
    };

    _fs2["default"].readdirSync(directory).forEach(function (file) {
      var fullPath = "" + directory + "/" + file;

      if (file === "index.js") {
        _this.dependency(fullPath);

        route.component = fullPath;

        var path = directory.replace(basePath, "");

        if (path === "") {
          path = "/";
        } else if (path.startsWith("/")) {
          path = path.replace(/^\//, "");
        }

        route.path = path;
      } else if (file !== "node_modules" && file !== ".git") {
        if (_fs2["default"].statSync(fullPath).isDirectory()) {
          var childRoute = buildRouteForDirectory(fullPath);

          if (childRoute) {
            route.childRoutes.push(childRoute);
          }
        }
      }
    });

    if (route.component && route.path) {
      return "\n        {\n          component: require(" + JSON.stringify(route.component) + ")\n        , path: " + JSON.stringify(route.path) + "\n        , childRoutes: [" + route.childRoutes.join(",") + "]\n        }\n      ";
    } else {
      return null;
    }
  });

  var routes = buildRouteForDirectory(basePath);

  finalCallback(null, "module.exports = " + routes + ";");
};

module.exports = exports["default"];