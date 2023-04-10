import { Disclosure } from "@headlessui/react";
import { useEffect, useState, ChangeEvent, useMemo } from "react";
import { ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Tab, TabChild } from "virtual:reload-on-update-in-background-script";

export default function App() {
  const [showModal, setShowModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchingValue, setSearchingValue] = useState<string>("");
  const [tabs, setTabs] = useState<Tab[] | undefined>(undefined);

  const handleKeyPress = (event) => {
    if (
      event.key === "K" &&
      event.altKey &&
      event.ctrlKey &&
      event.shiftKey &&
      !showModal
    ) {
      setShowModal(true);
      return;
    }
    // setShowModal(false);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const goTab = (tab: TabChild) => {
    chrome.runtime.sendMessage(
      { command: "switchToTab", tabId: tab.id },
      (response) => {
        console.log(response.result);
      }
    );
  };

  // const tabSearching = (event: ChangeEvent<HTMLInputElement>) => {
  //   // need Throttling

  //   console.log(currentTabs, "!!!");
  //   setTabs(currentTabs as unknown as Tab[]);
  // };

  const queryTabs = () => {
    chrome.runtime.sendMessage({ command: "getTabsInfo" }, (response) => {
      console.log(response.tabs);

      setTabs(response.tabs);
      // Do something with the tabs info
    });
  };

  useEffect(() => {
    queryTabs();
    document.addEventListener("keydown", handleKeyPress, false);

    return () => {
      document.removeEventListener("keydown", handleKeyPress, false);
    };
  }, []);

  const searchingTabs = useMemo(
    () =>
      tabs?.map((tab) => ({
        ...tab,
        children: tab.children.filter((f) => f.label.includes(searchingValue)),
      })),
    [searchingValue, tabs]
  );

  return (
    showModal && (
      <div className="app-content !fixed !inset-0 !z-10 !overflow-y-hidden !rounded-xl">
        <div className="!flex !items-center !justify-center !min-h-screen !pt-4 !px-4 !pb-20 !text-center !sm:block !sm:p-0 !z-20">
          <div
            className="!fixed !inset-0 !transition-opacity"
            aria-hidden="true"
            onClick={() => setShowModal(false)}
          >
            <div className="!absolute !inset-0 !bg-gray-900 !opacity-75"></div>
          </div>
          {/* 内容区 */}

          <div className="!relative !w-3/5 !bg-gray-300 !max-h-96 !z-30 !overflow-y-hidden !rounded-xl !-top-48">
            <div className="!w-full !relative">
              <MagnifyingGlassIcon className="!absolute !ml-3 !h-4 !top-1/2 !-translate-y-1/2"></MagnifyingGlassIcon>
              <input
                className="!focus:ring-2 !focus:ring-blue-500 !focus:outline-none !appearance-none !w-full !text-sm !leading-6 !text-slate-900 !placeholder-slate-400 !rounded-md !py-2 !pl-10 !ring-1 !ring-slate-200 !shadow-sm"
                type="text"
                aria-label="Input a tab name"
                placeholder="Input a tab name..."
                onChange={(evt: ChangeEvent<HTMLInputElement>) =>
                  setSearchingValue(evt.target.value)
                }
                value={searchingValue}
              />
            </div>

            <ul className="!h-96 !overflow-scroll">
              {searchingTabs &&
                searchingTabs.map((tab, key) => (
                  <li key={key}>
                    <Disclosure defaultOpen>
                      {({ open }) => (
                        <>
                          <Disclosure.Button className="!flex !w-full !justify-between !rounded-lg !bg-purple-100 !px-4 !py-2 !text-left !text-sm !font-medium !text-purple-900 !hover:bg-purple-200 !focus:outline-none !focus-visible:ring !focus-visible:ring-purple-500 !focus-visible:ring-opacity-75">
                            <span>{tab.label}</span>
                            <ChevronUpIcon
                              className={`${
                                open ? "!rotate-180 transform" : ""
                              } !h-5 !w-5 !text-purple-500`}
                            />
                          </Disclosure.Button>
                          <Disclosure.Panel className="!px-4 !pt-4 !pb-2 !text-sm !text-gray-500">
                            {tab.children.map((t, tk) => (
                              <p
                                key={tk}
                                className="!cursor-pointer !text-left"
                                onClick={() => goTab(t)}
                              >
                                {t.label}
                              </p>
                            ))}
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    )
  );
}

// <div className="content-view fixed w-screen h-screen bg-black/80 z-[9999] top-0 left-0"></div>

// export default function Example() {
//   return (
//     <div className="w-full px-4 pt-16">
//       <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-2">

//       </div>
//     </div>
//   )
// }

{
  /* <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                      <span>What is your refund policy?</span>
                      <ChevronUpIcon
                        className={`${
                          open ? "rotate-180 transform" : ""
                        } h-5 w-5 text-purple-500`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                      If you're unhappy with your purchase for any reason, email
                      us within 90 days and we'll refund you in full, no
                      questions asked.
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
              <Disclosure as="div" className="mt-2">
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                      <span>Do you offer technical support?</span>
                      <ChevronUpIcon
                        className={`${
                          open ? "rotate-180 transform" : ""
                        } h-5 w-5 text-purple-500`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                      No.
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure> */
}
