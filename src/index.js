import fs from "fs";
import loaderUtils from "loader-utils";

module.exports = function(source) {
  let callback = this.async();
  let isSync = "function" !== typeof callback;
  let finalCallback = callback || this.callback;

  let basePath = this.context;

  const buildRouteForDirectory = (directory) => {
    let route = {
      component: null
    , path: null
    , childRoutes: []
    , dynamicRoutes: []
    };

    fs.readdirSync(directory).forEach((file) => {
      let fullPath = `${directory}/${file}`;

      if(file === "index.js") {
        this.dependency(fullPath);

        route.component = fullPath;

        let path = directory.replace(basePath, "");

        // all react-router paths are absolute
        if(path === "") {
          path = "/";
        }
        else {
          // simply replace @ with : for dynamic segments in react-router
          path = path.replace(/@/g, ":");
        }

        route.path = path;
      }
      else if(file !== "node_modules" && file !== ".git") {
        if(fs.statSync(fullPath).isDirectory()) {
          let childRoute = buildRouteForDirectory(fullPath);

          if(childRoute) {
            if(file.startsWith("@")) {
              route.dynamicRoutes.push(childRoute);
            }
            else {
              route.childRoutes.push(childRoute);
            }
          }
        }
      }
    });

    if(route.component && route.path) {
      let childRoutes = [...route.childRoutes, ...route.dynamicRoutes];

      return `
        {
          getComponents: function(location, callback) {
            require.ensure([], function(require) {
              callback(null,
                require(${loaderUtils.stringifyRequest(this, route.component)}).default
              );
            });
          }
        , path: ${JSON.stringify(route.path)}
        , childRoutes: [${childRoutes.join(",")}]
        }
      `;
    }
    else {
      return null;
    }
  }

  let routes = buildRouteForDirectory(basePath);

  finalCallback(null, `module.exports = ${routes};`);
}
