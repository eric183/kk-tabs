import { group } from "console";
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
// chrome.tabs.query({}, (tabs) => {
//   tabs.forEach(function (tab) {

//   });
// });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "getTabsInfo") {
    let test_groups = [];

    chrome.tabGroups.query({ collapsed: false }, (groups) => {
      test_groups = [...test_groups, ...groups];
      chrome.tabGroups.query({ collapsed: true }, (groups) => {
        test_groups = [...test_groups, ...groups];

        chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
          const groups = <chrome.tabs.Tab>{};

          for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];

            const groupId = tab.groupId;
            const title = tab.title;
            const url = tab.url;
            const faviconUrl = tab.favIconUrl;
            if (!groups[groupId]) {
              const FIND_GROUP = test_groups.find((g) => g.id === groupId);
              groups[groupId] = {
                // ...groups,
                id: groupId,
                label: `group: ${groupId}`,
                title: FIND_GROUP ? FIND_GROUP.title : "",
                children: [],
              };
            }
            groups[groupId].children.push({
              id: tab.id,
              label: title,
              iconUrl: faviconUrl,
              url: url,
              audible: tab.audible,
              isActive: tab.active,
              pinned: tab.pinned,
              parentId: groupId,
              muted: tab.mutedInfo.muted,
            });
          }
          const result = Object.keys(groups).map(function (groupId) {
            return groups[groupId];
          });

          sendResponse({ tabs: result });
        });
      });
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

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.command === "muteTab") {
    const tabId = request.tabId;
    const tab = await chrome.tabs.get(tabId);
    const muted = !tab.mutedInfo.muted;

    chrome.tabs.update(tabId, { muted });
    sendResponse({
      id: tabId,
      muted: muted,
    });
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
