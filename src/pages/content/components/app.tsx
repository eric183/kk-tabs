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
  const [isSlash, setSlash] = useState<boolean>(false);
  const [seletedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null!);
  const scrollRef = useRef<HTMLUListElement>(null!);

  const searchingTabs = useMemo(() => {
    let trueIndex = 0;

    if (searchingValue.startsWith("/")) {
      return tabs;
    }
    return tabs?.map((tab) => {
      return {
        ...tab,
        children: tab.children.filter((f) => {
          if (
            f.label
              .toLocaleLowerCase()
              .includes(searchingValue.toLocaleLowerCase())
          ) {
            f.trueIndex = trueIndex;
            trueIndex++;
            return true;
          }
        }),
      };
    });
  }, [searchingValue, tabs]);

  const handleKeyPress = (event) => {
    // console.log(event.key.toLocaleLowerCase());
    if (
      event.key.toLocaleLowerCase() === "k" &&
      // event.altKey &&
      // event.ctrlKey &&
      event.metaKey | event.altKey &&
      event.shiftKey &&
      !showModal
    ) {
      setShowModal(true);
      return;
    }

    if (event.key.toLocaleLowerCase() === "esc") {
      setShowModal(false);
    }
    if (event.key.toLocaleLowerCase() === "escape") {
      setShowModal(false);
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
        // console.log(response.result);
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
      // console.log(response.tabs);
      // console.log(response, "whole");

      setTabs(response.tabs);
      // Do something with the tabs info
    });
  };

  const Badges = useMemo(() => {
    if (!searchingValue.startsWith("/")) {
      return false;
    }

    switch (searchingValue) {
      case "/chat": {
        return (
          <span className="!ml-6 bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
            Chat
          </span>
        );
      }
      case "/draw": {
        return (
          <span className="!ml-6 bg-purple-100 text-purple-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">
            Draw
          </span>
        );
      }

      default:
        return false;
    }
  }, [searchingValue]);

  const adjustFontSize = () => {
    const htmlFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );

    if (htmlFontSize === 16) return;

    const scale = htmlFontSize / 16; // 按照 16px 作为标准大小
    const elements = document.querySelectorAll(
      ".kktab-app-list, .kktab-app-list *"
    ); // .my-component 是你组件的选择器

    Array.from(elements).forEach((element: any) => {
      element.style.transform = "scale(" + scale + ")"; // 使用 transform 缩放元素
      element.style.transformOrigin = "0 0"; // 把缩放基点设置为元素的左上角
    });
  };

  useEffect(() => {
    // queryTabs();

    document.addEventListener("keydown", handleKeyPress, false);

    return () => {
      document.removeEventListener("keydown", handleKeyPress, false);
    };
  }, []);

  useEffect(() => {
    queryTabs();

    setTimeout(() => {
      inputRef?.current?.focus();
    }, 100);
  }, [showModal]);

  // useLayoutEffect(() => {}, []);

  return (
    <div
      className={`kktab-app-content !fixed !inset-0 !z-[999] !overflow-y-hidden items-end justify-center ${
        showModal ? "!flex" : "!hidden"
      }`}
    >
      <div
        className="!inset-0 !transition-opacity"
        aria-hidden="true"
        onClick={() => setShowModal(false)}
      >
        <div className="!absolute !inset-0 !bg-gray-900 !opacity-75"></div>
      </div>
      {/* 内容区 */}

      <div className="!absolute !w-3/5 !bg-gray-900 h-[50%] !z-30 !rounded-xl top-[10%] border border-gray-400 overflow-y-hidden flex flex-col kktab-app-list">
        <div className="!w-full !relative !border-b flex items-center">
          <MagnifyingGlassIcon className="!absolute !ml-3 !h-4 !top-1/2 !-translate-y-1/2 !text-white searchIcon"></MagnifyingGlassIcon>
          {/* to done */}
          {/* {!searchingValue.startsWith("/") && (
            <MagnifyingGlassIcon className="!absolute !ml-3 !h-4 !top-1/2 !-translate-y-1/2 !text-white"></MagnifyingGlassIcon>
          )} */}
          {/* {searchingValue.startsWith("/") ? (
            { Badges }
          ) : (
            <MagnifyingGlassIcon className="!absolute !ml-3 !h-4 !top-1/2 !-translate-y-1/2 !text-white"></MagnifyingGlassIcon>
          )} */}
          {/* {Badges} */}
          <input
            ref={inputRef}
            className="!focus:outline-none !appearance-none !w-full !text-[14px] !leading-6 !text-white !placeholder-slate-400 !py-4 !pl-10 !bg-gray-900 !shadow-sm !rounded-xl !rounded-b-none"
            type="text"
            aria-label="Input a tab name"
            placeholder="Input a tab name..."
            onChange={(evt: ChangeEvent<HTMLInputElement>) => {
              setSearchingValue(evt.target.value);

              if (evt.target.value.startsWith("/")) {
                setSlash(true);

                return;
              }

              setSlash(false);
            }}
            value={searchingValue}
            onKeyUp={(event) => {
              if (isSlash) return;
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
          />
        </div>

        {isSlash ? (
          <figure>
            <ul className="kktabs-badges !mx-4 !my-2">
              <li>
                <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                  Chat
                </span>
              </li>
            </ul>
            <article></article>
          </figure>
        ) : (
          <ul
            className="flex-1 !overflow-scroll !mt-4 !px-2 !text-gray-200 flex flex-col ios-scroll min-h-min"
            ref={scrollRef}
          >
            {searchingTabs &&
              searchingTabs.map(
                (tab, key) =>
                  tab.children.length > 0 && (
                    <li key={key} className="pl-2 mb-2">
                      <Disclosure defaultOpen>
                        {({ open }) => (
                          <>
                            <Disclosure.Button
                              className="!text-left !mb-0 cursor-pointer"
                              as="div"
                            >
                              <span className="!text-sm !text-gray-400">
                                {tab.title ? tab.title : "Others"}
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
                                      className="logoImage rounded-2xl w-5 ml-1.5 mr-2"
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
                  )
              )}
          </ul>
        )}
      </div>
    </div>
  );
}
