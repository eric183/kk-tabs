// When the button is clicked, inject setPageBackgroundColor into current page
document
  .querySelector("button#changeColor")
  .addEventListener("click", async () => {
    document.querySelector("#emailChanger").value;
    chrome.storage.sync.set({
      email: document.querySelector("#emailChanger").value,
    });

    // let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // chrome.storage.sync.set({ email: "kk297466058@gmail.com" });

    // chrome.scripting.executeScript({
    //   target: { tabId: tab.id },
    //   function: () => {
    //     const divMain = document.createElement("div");
    //     divMain.id = "divMain";
    //     divMain.style.background = "red";
    //     divMain.style.width = "500px";
    //     divMain.style.height = "100vh";
    //     divMain.style.position = "fixed";
    //     divMain.style.top = "0";
    //     divMain.style.right = "0";
    //     divMain.style.zIndex = "9999";
    //     document.body.appendChild(divMain);
    //     console.log(document.body);
    //     // chrome.storage.sync.get("color", ({ color }) => {

    //     // const nodes = Array.from(document.querySelectorAll('.slider__slides__item'));
    //     // console.log(nodes.map((x=> x.querySelector('img').src)));
    //     //   document.body.style.backgroundColor = color;
    //     // });
    //   },
    // });
  });

// // The body of this function will be executed as a content script inside the
// // current page
// function setPageBackgroundColor() {
//   chrome.storage.sync.get("color", ({ color }) => {
//     console.log(document.body);
//    // const nodes = Array.from(document.querySelectorAll('.slider__slides__item'));

//     // console.log(nodes.map((x=> x.querySelector('img').src)));

//     document.body.style.backgroundColor = color;
//   });
// }
