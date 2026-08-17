(function (global) {
  global.__APP_RUNTIME_CONFIG__ = Object.assign(
    {
      baseURL: "/api",
      // 更换或移除封装厂商时，只需调整这里的 App 容器配置。
      appContainer: {
        enabled: true,
        userAgentPattern: "LT-APP",
        bridge: {
          scriptUrl: "https://www.yimenapp.com/doc/js/jsbridge-mini.js",
          globalName: "jsBridge",
          inAppProperty: "inApp",
          openInBrowserMethod: "openInBrowser",
          loadTimeout: 2000
        },
        statusBar: {
          enabled: true,
          setMethod: "setStatusBar",
          getMethod: "getStatusBar",
          heightProperty: "height",
          callbackTimeout: 1500,
          fallbackHeight: 24,
          options: {
            visible: true,
            contentStyle: "default",
            overlays: true
          }
        },
        launch: {
          scheme: "ltapp459991",
          path: "app",
          urlParam: "url"
        },
        browserFallback: {
          queryParam: "xapp-target",
          queryValue: "browser"
        }
      }
    },
    global.__APP_RUNTIME_CONFIG__ || {}
  );
})(window);
