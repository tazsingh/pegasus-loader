import fs from "fs";

export default function(source) {
  let callback = this.async();
  let isSync = "function" !== typeof callback;
  let finalCallback = callback || this.callback;

  let basePath = this.context;

  const buildRouteForDirectory = (directory) => {
    let route = {
      component: null
    , path: null
    , childRoutes: []
    };

    fs.readdirSync(directory).forEach((file) => {
      let fullPath = `${directory}/${file}`;

      if(file === "index.js") {
        this.dependency(fullPath);

        route.component = fullPath;

        let path = directory.replace(basePath, "");

        if(path === "") {
          path = "/";
        }
        else if(path.startsWith("/")) {
          path = path.replace(/^\//, "");
        }

        route.path = path;
      }
      else if(file !== "node_modules" && file !== ".git") {
        if(fs.statSync(fullPath).isDirectory()) {
          let childRoute = buildRouteForDirectory(fullPath);

          if(childRoute) {
            route.childRoutes.push(childRoute);
          }
        }
      }
    });

    if(route.component && route.path) {
      return `
        {
          component: require(${JSON.stringify(route.component)})
        , path: ${JSON.stringify(route.path)}
        , childRoutes: [${route.childRoutes.join(",")}]
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
