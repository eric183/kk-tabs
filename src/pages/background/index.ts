import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");

// const color = "#3aa757";

// chrome.runtime.onInstalled.addListener(async () => {
//   chrome.storage.sync.set({ color });
//   chrome.storage.sync.set({ email: "" });
// });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "getTabsInfo") {
    chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
      const groups = <chrome.tabs.Tab>{};
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];

        const groupId = tab.groupId;
        const title = tab.title;
        const url = tab.url;
        const faviconUrl = tab.favIconUrl;
        if (!groups[groupId]) {
          groups[groupId] = {
            // ...groups,
            id: groupId,
            label: `分组: ${groupId}`,
            title: groups.title,
            children: [],
          };
        }
        groups[groupId].children.push({
          id: tab.id,
          label: title,
          iconUrl: faviconUrl,
          url: url,
          isPlaying: tab.audible,
          isActive: tab.active,
          pinned: tab.pinned,
          parentId: groupId,
        });
      }
      const result = Object.keys(groups).map(function (groupId) {
        return groups[groupId];
      });
      sendResponse({ tabs: result });
    });
  }
  return true;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "switchToTab") {
    const tabId = request.tabId;
    chrome.tabs.update(tabId, { active: true });
    sendResponse({ result: "success" });
  }
});

// 收起当前分组
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "collapseGroup") {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      if (tabs.length === 0) return;
      const currentTab = tabs[0] as any;
      const currentGroupId = currentTab.groupId;
      chrome.tabs.move(currentTab.id, { index: -1 });
      sendResponse({ result: "success" });
    });
  }
  return true;
});

// chrome.runtime.onMessageExternal.addListener(
//   (request, sender, sendResponse) => {
//     if (request.jwt) {
//       console.log("Token ::: ", request.jwt);
//       sendResponse({ success: true, message: "Token has been received" });
//     }
//   }
// );
