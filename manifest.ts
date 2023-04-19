import packageJson from "./package.json";

/**
 * After changing, please reload the extension at `chrome://extensions`
 */
const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: "KK Tab",
  version: packageJson.version,
  description: packageJson.description,
  options_page: "src/pages/options/index.html",
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  permissions: [
    // "identity",
    // "contextMenus",
    // "storage",
    // "scripting",
    "activeTab",
    "tabs",
    "tabGroups",
  ],
  action: {
    default_popup: "src/pages/popup/index.html",
    default_icon: {
      "16": "favicon-16x16.png",
      "32": "favicon-32x32.png",
      "96": "favicon-96x96.png",
      "128": "favicon-128x128.png",
    },
  },
  // chrome_url_overrides: {
  //   newtab: "src/pages/newtab/index.html",
  // },
  icons: {
    "16": "favicon-16x16.png",
    "32": "favicon-32x32.png",
    "96": "favicon-96x96.png",
    "128": "favicon-128x128.png",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*", "<all_urls>"],
      js: ["src/pages/content/index.js"],
      // KEY for cache invalidation
      css: ["assets/css/contentStyle<KEY>.chunk.css"],
    },
  ],
  devtools_page: "src/pages/devtools/index.html",
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "cat-128.png",
        "cat-34.png",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "favicon-96x96.png",
        "favicon-128x128.png",
      ],
      matches: ["*://*/*"],
    },
  ],
};

export default manifest;
