class Router {
  constructor() {
    this._routes = {};

    window.addEventListener("popstate", () => {
      this.handleRoute(window.location.pathname);
    });

    document.body.addEventListener("click", (event) => {
      const target = event.target.closest("a");
      if (target) {
        const link = target;
        if (link.href && link.href.startsWith(window.location.origin)) {
          event.preventDefault();
          const path = link.getAttribute("href");
          if (path) {
            this.navigate(path);
          } else {
            console.warn("Link has no href attribute.");
          }
        }
      }
    });
  }

  addRoute(path, handler) {
    if (this._routes[path]) {
      console.warn(`Route already exists: ${path}`);
      return;
    }
    this._routes[path] = handler;
  }

  navigate(path) {
    if (path != "/game-online") {
      localStorage.removeItem("game_uid");
    }
    if (this._routes[path]) {
      window.history.pushState({}, "", path);
      this.handleRoute(path);
    } else {
      console.warn(`No route found for: ${path}`);
      this.redirectToHome();
    }
  }

  selfNavigate() {
    this.handleRoute(window.location.pathname);
  }

  get routes() {
    return this._routes;
  }

  handleRoute(path) {
    const handler = this._routes[path];
    if (handler) {
      try {
        handler();
      } catch (error) {
        console.error("Route handler error:", error);
        alert("An error occurred. You are being redirected to the home page.");
        this.redirectToHome();
      }
    } else {
      console.warn(`No handler for route: ${path}`);
      if (this._routes["/404"]) {
        this._routes["/404"]();
      } else {
        this.redirectToHome();
      }
    }
  }

  redirectToHome() {
    if (this._routes["/"]) {
      window.history.pushState({}, "", "/");
      try {
        this._routes["/"]();
      } catch (error) {
        console.error("Home route error:", error);
        alert("An error occurred on the home route.");
      }
    }
  }
}

const router = new Router();

export default router;
