import fs from "fs";
import loaderUtils from "loader-utils";

export default function pegasusLoader(source) {
  let callback = this.async();
  let isSync = "function" !== typeof callback;
  let finalCallback = callback || this.callback;

  let basePath = this.context;

  const buildRouteForDirectory = (directory, parentDirectoryPath) => {
    let route = {
      component: null
    , path: null
    , childRoutes: []
    , dynamicRoutes: []
    };

    let directoryItems = fs.readdirSync(directory);

    let indexOfRouteComponent = directoryItems.indexOf("index.js");

    // evaluate the route component first to set up parent paths
    if(indexOfRouteComponent >= 0) {
      let fullPath = `${directory}/index.js`;

      directoryItems.splice(indexOfRouteComponent, 1);

      console.log("FULL PATH", fullPath);
      this.dependency(fullPath);

      route.component = fullPath;

      let path;

      // we only want the route path to be that of the previous parent onwards
      if(parentDirectoryPath) {
        path = directory.replace(parentDirectoryPath, "");
      }
      else {
        path = directory.replace(basePath, "");
      }

      // all react-router paths are absolute
      if(path === "") {
        path = "/";
      }
      else {
        // simply replace @ with : for dynamic segments in react-router
        path = path.replace(/@/g, ":");
      }

      // this is now the parent route path of any child routes processed later
      parentDirectoryPath = `${directory}/`;

      console.log("PATH", path);

      route.path = path;
    }

    directoryItems.forEach((file) => {
      let fullPath = `${directory}/${file}`;

      if(file !== "node_modules" && file !== ".git") {
        if(fs.statSync(fullPath).isDirectory()) {
          console.log("PARENT PATH", parentDirectoryPath);

          let childRoute = buildRouteForDirectory(fullPath, parentDirectoryPath);

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
      // evaluate static routes first and dynamic segments last
      let childRoutes = [...route.childRoutes, ...route.dynamicRoutes];

      // this is the only bit of code emitted to your application
      return `
        {
          getComponents: function(location, callback) {
            require.ensure([], function(require) {
              callback(null,
                require(${loaderUtils.stringifyRequest(this, route.component)})
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
