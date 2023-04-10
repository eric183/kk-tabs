import { Disclosure } from "@headlessui/react";
import {
  useEffect,
  useState,
  ChangeEvent,
  useMemo,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  ChevronUpIcon,
  MagnifyingGlassIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/20/solid";
import { Tab, TabChild } from "virtual:reload-on-update-in-background-script";

export default function App() {
  const [showModal, setShowModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchingValue, setSearchingValue] = useState<string>("");
  const [tabs, setTabs] = useState<Tab[] | undefined>(undefined);

  const [seletedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null!);
  const scrollRef = useRef<HTMLUListElement>(null!);

  const searchingTabs = useMemo(() => {
    let trueIndex = 0;
    return tabs?.map((tab) => {
      return {
        ...tab,
        children: tab.children.filter((f) => {
          f.trueIndex = trueIndex;
          trueIndex++;
          return f.label
            .toLocaleLowerCase()
            .includes(searchingValue.toLocaleLowerCase());
        }),
      };
    });
  }, [searchingValue, tabs]);

  const handleKeyPress = (event) => {
    if (
      event.key.toLocaleLowerCase() === "k" &&
      // event.altKey &&
      // event.ctrlKey &&
      event.shiftKey &&
      event.metaKey &&
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

  useEffect(() => {
    setTimeout(() => {
      inputRef?.current?.focus();
    }, 100);
  }, [showModal]);

  useEffect(() => {
    console.log(seletedIndex, searchingTabs);
  }, [seletedIndex, searchingTabs]);

  console.log(searchingTabs, "indexR");
  return (
    showModal && (
      <div
        className="app-content !fixed !inset-0 !z-[999] !overflow-y-hidden"
        onKeyUp={(event) => {
          console.log(event);
          if (event.key.toLocaleLowerCase() === "enter") {
            let currentTab;

            searchingTabs.some(
              (tab) =>
                (currentTab = tab.children.find(
                  (c) => c.trueIndex === seletedIndex
                ))
            );

            goTab(currentTab as unknown as TabChild);
            // seletedIndex
          }

          if (event.key.toLocaleLowerCase() === "arrowup") {
            if (seletedIndex >= 0) {
              setSelectedIndex(() => seletedIndex - 1);

              document
                .querySelector(`[data-index="${seletedIndex - 1}"]`)
                .scrollIntoView();
            }
          }

          if (event.key.toLocaleLowerCase() === "arrowdown") {
            const maxIndex = searchingTabs.reduce(
              (pre, next) => pre + next.children.length,
              0
            );

            if (seletedIndex < maxIndex - 1) {
              setSelectedIndex(() => seletedIndex + 1);

              document
                .querySelector(`[data-index="${seletedIndex + 1}"]`)
                .scrollIntoView();
            }
          }
          // console.log(event.target.classList);
        }}
      >
        <div className="!flex !items-center !justify-center !min-h-screen !pt-4 !px-4 !pb-20 !text-center !sm:block !sm:p-0">
          <div
            className="!inset-0 !transition-opacity"
            aria-hidden="true"
            onClick={() => setShowModal(false)}
          >
            <div className="!absolute !inset-0 !bg-gray-900 !opacity-75"></div>
          </div>
          {/* 内容区 */}

          <div className="!relative !w-3/5 !bg-gray-900 !max-h-96 !z-30 !rounded-xl !-top-48 border border-gray-400 overflow-y-hidden flex flex-col">
            <div className="!w-full !relative !border-b">
              <MagnifyingGlassIcon className="!absolute !ml-3 !h-4 !top-1/2 !-translate-y-1/2 !text-white"></MagnifyingGlassIcon>
              <input
                ref={inputRef}
                className="!focus:outline-none !appearance-none !w-full !text-sm !leading-6 !text-white !placeholder-slate-400 !py-4 !pl-10 !bg-gray-900 !shadow-sm !rounded-xl !rounded-b-none"
                type="text"
                aria-label="Input a tab name"
                placeholder="Input a tab name..."
                onChange={(evt: ChangeEvent<HTMLInputElement>) =>
                  setSearchingValue(evt.target.value)
                }
                value={searchingValue}
              />
            </div>

            <ul
              className="flex-1 !overflow-scroll !mt-4 !px-2 !text-gray-200 flex flex-col"
              ref={scrollRef}
            >
              {searchingTabs &&
                searchingTabs.map((tab, key) => (
                  <li key={key} className="pl-2 mb-2 flex-1">
                    <Disclosure defaultOpen>
                      {({ open }) => (
                        <>
                          <Disclosure.Button
                            className="!text-left !mb-0 cursor-pointer"
                            as="div"
                          >
                            <span className="!text-sm !text-gray-400">
                              {tab.label}
                            </span>
                          </Disclosure.Button>
                          <Disclosure.Panel
                            className="!pt-2 !pb-2 !text-sm !text-white"
                            as="ul"
                          >
                            {tab.children.map((t: TabChild, tk) => {
                              return (
                                <li
                                  data-index={t.trueIndex}
                                  key={tk}
                                  className={`!flex !items-center !leading-10 mr-5 hover:bg-slate-200/25 !rounded-md !overflow-x-hidden truncate ${
                                    seletedIndex === t.trueIndex
                                      ? "bg-slate-200/25"
                                      : ""
                                  }`}
                                >
                                  <img
                                    src={t.iconUrl}
                                    className="rounded-2xl w-5 ml-1.5 mr-2"
                                  />
                                  <span
                                    className="!w-full !cursor-pointer !text-left !whitespace-nowrap"
                                    onClick={() => goTab(t)}
                                  >
                                    {t.label}
                                  </span>

                                  {t.isPlaying && (
                                    <SpeakerWaveIcon className="!ml-3 !h-4 !text-white" />
                                  )}
                                </li>
                              );
                            })}
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
