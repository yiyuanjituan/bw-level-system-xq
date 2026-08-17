(function (global) {
  global.__APP_RUNTIME_CONFIG__ = Object.assign(
    {
      baseURL: "/api"
    },
    global.__APP_RUNTIME_CONFIG__ || {}
  );
})(window);
