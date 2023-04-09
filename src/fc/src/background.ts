const color = "#3aa757";

chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.sync.set({ color });
  chrome.storage.sync.set({ email: "" });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.command === "getTabsInfo") {
    chrome.tabs.query({}, function (tabs) {
      const groups = <any>{};
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        const groupId = tab.groupId;
        const title = tab.title;
        const url = tab.url;
        const faviconUrl = tab.favIconUrl;
        if (!groups[groupId]) {
          groups[groupId] = {
            id: groupId,
            label: "分组 " + groupId,
            children: [],
          };
        }
        groups[groupId].children.push({
          id: tab.id,
          label: title,
          iconUrl: faviconUrl,
          url: url,
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
