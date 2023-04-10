try {
  chrome.devtools.panels.create(
    "Dev Tools",
    "favicon-16x16.png",
    "src/pages/panel/index.html"
  );
} catch (e) {
  console.error(e);
}
