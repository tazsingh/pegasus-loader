# pegasus-loader

Project Structure based Route declarations for [React Router](https://github.com/rackt/react-router) using [Webpack](https://github.com/webpack/webpack)

## Purpose

The purpose of pegasus-loader is to remove the need for writing route configuration by hand.

Many years ago, web developers simply put files in folders which described the structure of their applications.
Web browsers would request each URL and the web server would translate this URL into a path on the file system.

Since then, web applications have gotten more complex and the need to support multiple HTTP verbs for a single URL became necessary.
We had to start using a separate routing table to figure out where to send each request.

However these days, that type of complexity can be kept on the server where REST and GraphQL are the entry point.
The entry point for client side applications are always based on a simple HTTP GET request.

Today with tools such as Webpack to enable asynchronous payload chunking and React Router to provide declarative component-based routing,
it's possible to go back to simply putting files in folders and letting tools generate your routing configuration.

## How to use

This assumes that you have a Webpack project with React Router set up.
Please use [torontojs.com's Repo](https://github.com/torontojs/torontojs.com) as an example.

1. Install it and its dependencies from npm:

    `npm install --save pegasus-loader`
    
2. Use pegasus-loader with a given base path to generate routing configuration:

    ```js
    // will generate routing configuration for the current directory
    var routingConfiguration = require("pegasus!.");
    
    // an example of routing configuration for a nested directory
    var nestedRouteConfig = require("pegasus!./nestedDir");
    
    // example of routing configuration for a node_module
    var moduleRouteConfig = require("pegasus!./node_modules/exampleModule");
    ```
    
3. Use the `routingConfiguration` in [React Router](https://github.com/rackt/react-router)'s `Router`:

    ```js
    <Router>
      {routingConfiguration}
    </Router>
    ```
    
4. Sit back and let pegasus-loader maintain your routes!

## Ok, so how do I need to arrange my files and folders?

An example of this is available on [torontojs.com's Repo](https://github.com/torontojs/torontojs.com).

In essence, for a given URL in your application, take the path and add `/index.js` to determine the routable file.

For example, given the URL `http://myapp.com/about/the_team`, the React component that will render is located at `./about/the_team/index.js`.

### Hmm but what about dynamic segments?

Dynamic segments are handled by using a `@` instead of the `:` in [React Router](https://github.com/rackt/react-router)'s configuration.

Unfortunately the file system doesn't like the `:` character. So I've opted to use a `@` instead.
pegasus-loader will simply replace the `@` with a `:` in the path to your React component in order to handle dynamic segments.

For example, given the URL `http://myapp.com/users/12345`, the React component located at `./users/@userID/index.js` will render with `this.props.params.userID` set to `"12345"`.

## Advanced features

By having a declarative project-structure based routing system, the tooling can take over and do a lot for you.

pegasus-loader will automatically into [React Router](https://github.com/rackt/react-router)'s Dynamic Routing hooks to enable
lazy loading of Routable Components via Webpack asynchronous split points.

This means that just like in the early days when each page in our application was loaded on-demand by the browser, we can
similarily load each page and construct your application incrementally.

The best part is that you don't have to do anything! Just put a file in a folder and the tooling will do the rest.

## Example App

[**TorontoJS Website**](https://github.com/torontojs/torontojs.com) - A promotional website for TorontoJS to pull in JavaScript events from Toronto and the surrounding area. It also displays videos and general information about TorontoJS while serving as a base on which to expand upon. Uses pegasus-loader, Griffin.js, WebPack, React Router, Babel.js, and React Transform.

## Disussion

Join the [TorontoJS Slack](http://slack.torontojs.com) chat in the #help channel.

## Licence

MIT
