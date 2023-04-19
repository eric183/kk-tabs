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
  CubeIcon,
  HashtagIcon,
  MagnifyingGlassIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/20/solid";
import { Tab, TabChild } from "virtual:reload-on-update-in-background-script";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { normalize } from "path";

export default function App() {
  const [showModal, setShowModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchingValue, setSearchingValue] = useState<string>("");
  const [tabs, setTabs] = useState<Tab[] | undefined>(undefined);
  const [isSlash, setSlash] = useState<boolean>(false);
  const [seletedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null!);
  const disInputRef = useRef<HTMLInputElement>(null!);
  const disAtInputRef = useRef<HTMLInputElement>(null!);
  const scrollRef = useRef<HTMLUListElement>(null!);
  const getHashValue = (searchingValue: string, tabs: Tab[]) => {
    const currentHashTabs: Tab[] = [];
    let trueIndex = 0;

    tabs.forEach((tab) => {
      tab.children.forEach((c: TabChild) => {
        const link_label = c.url.replace(
          /http(s?):\/\/([0-9a-zA-Z]+\.)?([0-9a-zA-Z-_]+)\.[a-z]+(\/?).+/,
          "$3"
        );

        const _tab = currentHashTabs.find((x) => x.label === link_label);

        if (_tab) {
          _tab.children.push(c);
        } else {
          const newTab: Tab = {
            children: [c],
            id: currentHashTabs.length + 1,
            title: link_label.replace(
              /http(s?):\/\/([a-zA-Z]+\.)?([a-zA-Z]+)\.[a-z]+(\/?).+/,
              "$3"
            ),
            // title: link_label.replace(
            //   /http(s?):\/\/([a-z]+?)\.([a-z]+)\.[a-z]+.+/,
            //   "$2"
            // ),
            label: link_label,
          };
          currentHashTabs.push(newTab);
          // currentHashTabs.push();
        }
      });
    });

    return currentHashTabs?.map((tab) => {
      return {
        ...tab,
        children: tab.children.filter((f) => {
          if (
            f.label
              .toLocaleLowerCase()
              .includes(searchingValue.toLocaleLowerCase().replace("#", ""))
          ) {
            f.trueIndex = trueIndex;
            trueIndex++;
            return true;
          }
        }),
      };
    });
  };

  const getAttributeValue = (searchingValue: string, tabs: Tab[]) => {
    const trueIndex = 0;

    console.log(searchingValue, tabs);

    const matchCondition = (value) => {
      value = value.slice(1);
      switch (value) {
        case "playing": {
          return true;
        }

        case "play": {
          return true;
        }

        default: {
          return false;
        }
      }
    };

    return tabs?.map((tab) => {
      return {
        ...tab,
        children:
          searchingValue.length > 0
            ? tab.children.filter((tc) => {
                if (matchCondition(searchingValue) && tc.audible) {
                  return true;
                }
              })
            : tab.children,
      };
    });
  };

  const searchingTabs = useMemo(() => {
    let trueIndex = 0;

    if (searchingValue.startsWith("#")) {
      return getHashValue(searchingValue, tabs);
    }

    if (searchingValue.startsWith("@")) {
      return getAttributeValue(searchingValue, tabs);
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

  const isNormalized = () => {
    if (searchingValue.startsWith("#") || searchingValue.startsWith("@")) {
      return false;
    }

    return true;
  };

  const muteBinder = (tab: TabChild) => {
    chrome.runtime.sendMessage(
      { command: "muteTab", tabId: tab.id },
      (responseTab: { id: number; muted: boolean }) => {
        console.log(responseTab, "...");

        const currentTabs = tabs?.map((tab) => {
          tab.children.forEach((tc: TabChild) => {
            if (tc.id === responseTab.id) {
              tc.muted = responseTab.muted;
            }
          });
          return tab;
        });

        setTabs(currentTabs);
      }
    );
  };

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

      <div className="kktab-app-list !absolute !w-3/5 !bg-gray-900 h-[50%] !z-30 !rounded-xl top-[10%] !shadow-md !shadow-indigo-500/50 overflow-y-hidden flex flex-col">
        <div className="!w-full !relative !border-b flex items-center">
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
          <InputGroup className="flex items-center">
            <InputLeftElement
              className="InputLeft-element !top-1/2"
              pointerEvents="none"
              // eslint-disable-next-line react/no-children-prop
              children={
                <>
                  {searchingValue.startsWith("#") && (
                    <HashtagIcon className="left-element !text-green-500"></HashtagIcon>
                  )}

                  {searchingValue.startsWith("@") && (
                    <CubeIcon className="left-element !text-sky-200"></CubeIcon>
                  )}

                  {isNormalized() && (
                    <MagnifyingGlassIcon className="!text-white left-element"></MagnifyingGlassIcon>
                  )}
                </>
              }
            />

            {searchingValue.startsWith("#") && (
              <Input
                ref={disInputRef}
                className="kk-input !focus:outline-none !appearance-none !w-full !text-[14px] !leading-6 !text-white !placeholder-slate-400 !bg-gray-900 !shadow-sm !rounded-xl !rounded-b-none placeholder-slate-400 focus:border-sky-500 focus:ring-sky-500 focus:ring-1"
                type="text"
                aria-label="Input a tab name"
                placeholder="Input a tab name..."
                onChange={(evt: React.ChangeEvent<HTMLInputElement> | any) => {
                  if (
                    evt.nativeEvent.inputType === "deleteContentBackward" &&
                    disInputRef.current.value.length === 0
                  ) {
                    setSearchingValue("");
                    // setTimeout(() => {
                    //   inputRef.current.focus();
                    // }, 0);
                    return;
                  }
                  setSearchingValue("#" + evt.target.value);
                }}
                onKeyUp={(evt: React.ChangeEvent<HTMLInputElement> | any) => {
                  if (
                    disInputRef.current.value.length === 0 &&
                    evt.key === "Backspace"
                  ) {
                    setSearchingValue("");
                    setTimeout(() => {
                      inputRef.current.focus();
                    }, 10);
                  }

                  if (evt.key === "Enter") {
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

                  if (evt.key === "ArrowUp") {
                    if (seletedIndex >= 0) {
                      setSelectedIndex(() => seletedIndex - 1);

                      document
                        .querySelector(`[data-index="${seletedIndex - 1}"]`)
                        .scrollIntoView();
                    }
                  }

                  if (evt.key === "ArrowDown") {
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
            )}

            {searchingValue.startsWith("@") && (
              <Input
                ref={disAtInputRef}
                className="kk-input !focus:outline-none !appearance-none !w-full !text-[14px] !leading-6 !text-white !placeholder-slate-400 !bg-gray-900 !shadow-sm !rounded-xl !rounded-b-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1"
                type="text"
                aria-label="Input a tab attribute like: 'playing'"
                placeholder="Input a tab attribute like: 'playing'"
                onChange={(evt: React.ChangeEvent<HTMLInputElement> | any) => {
                  if (
                    evt.nativeEvent.inputType === "deleteContentBackward" &&
                    disAtInputRef.current.value.length === 0
                  ) {
                    return;
                  }
                  setSearchingValue("@" + evt.target.value);
                }}
                onKeyUp={(evt: React.ChangeEvent<HTMLInputElement> | any) => {
                  if (
                    disAtInputRef.current.value.length === 0 &&
                    evt.key === "Backspace"
                  ) {
                    setSearchingValue("");
                    setTimeout(() => {
                      inputRef.current.focus();
                    }, 10);
                  }

                  if (evt.key === "Enter") {
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

                  if (evt.key === "ArrowUp") {
                    if (seletedIndex >= 0) {
                      setSelectedIndex(() => seletedIndex - 1);

                      document
                        .querySelector(`[data-index="${seletedIndex - 1}"]`)
                        .scrollIntoView();
                    }
                  }

                  if (evt.key === "ArrowDown") {
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
            )}

            {isNormalized() && (
              <Input
                ref={inputRef}
                className="kk-input !focus:outline-none !appearance-none !w-full !text-[14px] !leading-6 !text-white !placeholder-slate-400 !bg-gray-900 !shadow-sm !rounded-xl !rounded-b-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1"
                type="text"
                aria-label="Input a tab name"
                placeholder="Input a tab name..."
                onChange={(evt: ChangeEvent<HTMLInputElement>) => {
                  setSearchingValue(evt.target.value);

                  if (evt.target.value.startsWith("/")) {
                    setSlash(true);

                    return;
                  }

                  if (evt.target.value.startsWith("@")) {
                    setTimeout(() => {
                      disAtInputRef.current.focus();
                    }, 0);

                    return;
                  }

                  if (evt.target.value.startsWith("#")) {
                    setTimeout(() => {
                      disInputRef.current.focus();
                    }, 0);

                    return;
                  }

                  setSlash(false);
                }}
                value={searchingValue}
                onKeyDown={(event) => {
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
            )}
          </InputGroup>
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
                  tab.children?.length > 0 && (
                    <li key={key} className="pl-2 mb-2">
                      <Disclosure defaultOpen>
                        {({ open }) => (
                          <>
                            <Disclosure.Button
                              className="!text-left !mb-0 cursor-pointer"
                              as="div"
                            >
                              <span className="!text-[12px] !text-gray-400">
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
                                    className={`!flex !items-center !leading-10 mr-1 hover:bg-slate-200/25 !rounded-md !overflow-x-hidden truncate ${
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

                                    {t.audible &&
                                      (t.muted ? (
                                        <SpeakerXMarkIcon
                                          className="!ml-3 !h-4 mr-1 !text-white cursor-pointer"
                                          onClick={() => muteBinder(t)}
                                        />
                                      ) : (
                                        <SpeakerWaveIcon
                                          className="!ml-3 !h-4 mr-1 !text-white cursor-pointer"
                                          onClick={() => muteBinder(t)}
                                        />
                                      ))}
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
