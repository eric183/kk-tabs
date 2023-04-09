import _, { forEach, pick } from "lodash";
const KUSO_REQUEST_API = "https://app.doomsdaydetectiveagency.com";
// const KUSO_REQUEST_API = "http://localhost:3000";

// const email = "kk297466058@gmail.com";

const CHEKER_TOOL = true;

const faviconURL = chrome.runtime.getURL("images/favicon-32x32.png");

class ContentScript {
  favElement: HTMLImageElement | null;
  clientClickEvent: MouseEvent | null;
  tranlationCard: HTMLDivElement | null;
  lanModal: HTMLDivElement | null;
  lanInput: HTMLInputElement | null;
  selectWords: string;
  authChecked: boolean;
  constructor() {
    this.favElement = null;
    this.tranlationCard = null;
    this.lanModal = null;
    this.lanInput = null;
    this.clientClickEvent = null;
    this.selectWords = "";

    this.authChecked = CHEKER_TOOL;
    this.contentScriptInit();
  }

  private createTranslationCard = (translationInfo: {
    searchingInfo: {
      translations: any;
      searchingWord: string;
      searchingEngine: string;
    };
    sentences: any;
  }) => {
    this.tranlationCard = document.createElement("div");

    document.body.appendChild(this.tranlationCard);

    this.tranlationCard.id = "translation-card-dom";

    // this.tranlationCard.style.minHeight = "100px";
    this.tranlationCard.style.position = "fixed";
    this.tranlationCard.style.padding = "10px 15px";
    this.tranlationCard.style.background = "#fff";
    this.tranlationCard.style.color = "#111827";
    this.tranlationCard.style.zIndex = "999";
    this.tranlationCard.style.boxShadow = "#999 1px 1px 6px";
    this.tranlationCard.style.borderRadius = "6px";
    this.tranlationCard.style.fontSize = "15px";
    this.tranlationCard.style.fontWeight = "bolder";

    console.log(this.tranlationCard);
    if (this.clientClickEvent) {
      this.tranlationCard.style.left =
        this.clientClickEvent!.x + this.tranlationCard.clientWidth / 2 + "px";
      this.tranlationCard.style.top =
        this.clientClickEvent!.y + this.tranlationCard.clientWidth / 2 + "px";
    } else {
      this.tranlationCard.style.minWidth = "100px";
      this.tranlationCard.style.right = "30%";
      this.tranlationCard.style.top = "50%";
      this.tranlationCard.style.transform = "translateY(-50%)";
    }
    this.tranlationCard.style.opacity = "1";

    this.mapTranslationCardList(translationInfo, this.tranlationCard);

    console.log(translationInfo);
  };

  private mapTranslationCardList = (
    translationInfo: { searchingInfo: any; sentences: any },
    translationCardParentDom: HTMLDivElement
  ) => {
    const { searchingInfo, sentences } = translationInfo;
    const cardList = document.createElement("ul");
    cardList.style.listStyle = "none";
    cardList.style.margin = "0";
    cardList.style.padding = "0";

    translationCardParentDom.appendChild(cardList);

    let template = "";

    if (searchingInfo.translations && searchingInfo.translations.length > 0) {
      for (const i of searchingInfo.translations) {
        for (const m of i.terms) {
          template += `<li style="line-height: 25px">${m.name};</li>`;
        }
      }
    } else {
      for (const i of sentences) {
        template += `<li style="line-height: 25px">${i.trans};</li>`;
      }
    }

    cardList.innerHTML = template;
  };

  private removeTranslationCard = () => {
    if (this.tranlationCard) {
      document.body.removeChild(this.tranlationCard);
      this.tranlationCard = null;
    }
  };

  private searchTranslation = async () => {
    const responseText = await (
      await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh&dt=t&dt=bd&dj=1&q=${this.selectWords}`
      )
    ).json();

    const sentences = responseText.sentences.map(
      (sentence: { orig: string; trans: string }) =>
        pick(sentence, ["orig", "trans"])
    );

    const searchingInfo = {
      translations: responseText.dict
        ? responseText.dict.map(
            (d: { pos: any; terms: any[]; entry: any[] }) => ({
              pos: d.pos,
              terms: d.terms.map((t: any) => ({ name: t })),
              entries: d.entry.map((e) => ({
                reverse_translations: e.reverse_translation.map((n: any) => ({
                  name: n,
                })),
                word: e.word,
                score: e.score,
              })),
            })
          )
        : [],
      searchingWord: this.selectWords,
      searchingEngine: "google",
    };

    return {
      searchingInfo,
      sentences,
    };
  };

  private storeTranslationToDB = async (
    searchingInfo: {
      translations: any;
      searchingWord?: string;
      searchingEngine?: string;
    },
    sentences: any
  ) => {
    // Auth Unchecked!
    if (!this.authChecked) return;

    const emailInfo = await chrome.storage.sync.get("email");
    console.log(emailInfo, sentences);
    // console.log(searchingInfo.translations);
    if (
      searchingInfo.translations.length === 0 &&
      // searchingInfo.searchingWord?.includes(" ")
      (<string[]>searchingInfo.searchingWord?.split(" ")).length > 3
    ) {
      console.log("too many words");
      return;
    }

    // if (searchingInfo.translations && searchingInfo.translations.length > 0) {
    fetch(KUSO_REQUEST_API + "/api/dictInfo", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        ...searchingInfo,
        email: emailInfo.email,
        sentences:
          searchingInfo.translations.length > 0
            ? searchingInfo.translations
            : sentences,
        // screenShot: canvas.toDataURL("image/jpeg", 0.1),
      }),
    });
    // }
  };

  private transRunner = async () => {
    if (this.selectWords.length > 0) {
      const { searchingInfo, sentences } = await this.searchTranslation();

      this.storeTranslationToDB(searchingInfo, sentences);
      this.createTranslationCard({ searchingInfo, sentences });
      this.removeFavElement();
    }
  };

  private moveFavToCursor = () => {
    if (this.favElement && this.clientClickEvent) {
      this.favElement.style.left = this.clientClickEvent.x + "px";
      this.favElement.style.top = this.clientClickEvent.y + "px";
      this.favElement.style.opacity = "1";
    }
  };

  private createFavElement = () => {
    this.favElement = <HTMLImageElement>document.createElement("img");
    this.favElement.id = "wow-fav-cursor";
    this.favElement.src = faviconURL;
    this.favElement.style.position = "fixed";
    this.favElement.style.opacity = "0";
    this.favElement.style.zIndex = "999";
    // this.favElement.style.boxShadow = "#999 1px 1px 6px";
    this.favElement.style.borderRadius = "4px";
    document.body.appendChild(this.favElement);

    this.favElement.addEventListener(
      "click",
      _.debounce(this.transRunner, 150),
      false
    );
  };

  private createAndMoveFavToCursor = () => {
    if (!this.favElement) {
      this.createFavElement();
      this.moveFavToCursor();
    }
  };

  private setSelectWords = () => {
    const selection = document.getSelection()!;

    let text = "";

    for (let i = 0; i < selection.rangeCount; i++) {
      text += selection.getRangeAt(i);
    }

    this.selectWords = text.trim().toLowerCase();
  };

  private contentEngineEventBootstrap = async (evt: MouseEvent) => {
    // store mouseEvent
    this.clientClickEvent = evt;

    // set selectWord for later accessing
    this.setSelectWords();
    if (this.selectWords.length === 0) {
      this.removeEngineEventBootstrap(this.clientClickEvent);
    }

    if (this.selectWords.length > 0) {
      // move favicon to the mouse cursor
      this.createAndMoveFavToCursor();
      return;
    }

    this.removeFavElement();
  };

  private contentScriptInit = () => {
    document.body.addEventListener(
      "mouseup",
      // _.debounce(this.contentEngineEventBootstrap, 150),
      this.contentEngineEventBootstrap,
      // this.contentEngineEventBootstrap,
      false
    );

    // document.body.addEventListener("keydown", this.escBinder, false);

    if (!this.lanModal) {
      document.body.addEventListener(
        "keydown",
        this.manuallySearchBinder,
        false
      );
    }
  };

  private removeFavElement = () => {
    if (this.favElement) {
      this.favElement.removeEventListener(
        "click",
        _.debounce(this.transRunner, 150),
        false
      );
      document.body.removeChild(this.favElement);
      this.favElement = null;
      this.clientClickEvent = null;
      this.selectWords = "";
    }
  };

  private removeEngineEventBootstrap = (evt: MouseEvent) => {
    if ((<HTMLImageElement>evt.target).id !== "wow-fav-cursor") {
      this.removeFavElement();
      this.removeTranslationCard();
    }
  };

  private removeSearchBinder = () => {
    document.removeEventListener("keydown", this.manuallySearchBinder, false);
    console.log(this.lanModal);
    console.log(this.lanInput);
    if (this.lanModal && this.lanInput) {
      this.lanModal.firstElementChild!.removeChild(this.lanInput);
      document.body.removeChild(this.lanModal);

      this.lanModal = null;
      this.lanInput = null;
    }
  };

  private manuallySearchBinder = (evt: any) => {
    console.log(evt);
    if (
      evt.key.toLowerCase() === "enter" &&
      document.activeElement == this.lanInput
    ) {
      this.removeTranslationCard();

      this.selectWords = evt.target.value;

      this.transRunner();
    }

    if (evt.key.toLowerCase() === "escape") {
      this.removeSearchBinder();
      this.removeFavElement();
      this.removeTranslationCard();
    }

    if (
      evt.altKey &&
      evt.ctrlKey &&
      evt.shiftKey &&
      evt.key.toLowerCase() === "k"
    ) {
      chrome.runtime.sendMessage({ command: "getTabsInfo" }, (response) => {
        console.log(response.tabs);
        // Do something with the tabs info
      });

      chrome.runtime.sendMessage(
        { command: "switchToTab", tabId: 1313001361 },
        (response) => {
          console.log(response.result);
        }
      );
    }
    if (evt.ctrlKey && evt.shiftKey && evt.key.toLowerCase() === "f") {
      // console.log("manually search");
      this.removeFavElement();
      this.removeTranslationCard();
      this.lanModal = document.createElement("div");

      this.lanModal.addEventListener(
        "click",
        (evt) => {
          if ((evt.target as HTMLDivElement).id !== "lan-input") {
            this.removeSearchBinder();
          }
        },
        false
      );

      this.lanModal.id = "lan-modal";
      this.lanModal.style.position = "fixed";
      this.lanModal.style.top = "0";
      this.lanModal.style.left = "0";
      this.lanModal.style.width = "100%";
      this.lanModal.style.height = "100%";
      this.lanModal.style.backgroundColor = "rgb(203 213 225 / 55%)";
      this.lanModal.style.zIndex = "999";

      document.body.appendChild(this.lanModal);

      const content = `
        <div
          class="lan-modal-content" style="
            position: absolute;
            border-radius: 8px;
            padding: 5px 10px;
            margin: auto;
            width: 50%;
            height: 400px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);">

            <input id="lan-input" style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: white;
              border: 0 solid #e5e7eb;
              border-radius: 5px;
              line-height: inherit;
              font-size: 100%;
              border-color: #999;
              color: #999;
              padding: 5px;
            " />
        </div>
      `;

      this.lanModal.innerHTML = content;

      this.lanInput = <HTMLInputElement>document.querySelector("#lan-input")!;
      this.lanInput.focus();

      document.body.addEventListener("keydown", this.lanInputBinder, false);
    }
  };

  private lanInputBinder = (evt: any) => {
    console.log(evt);
    if (evt.key.toLowerCase() === "enter") {
      // this.removeTranslationCard();

      this.selectWords = evt.target.value;
      this.transRunner();
      // this.removeFavElement();
      // document.body.removeChild(modal);
    }
  };
}

new ContentScript();
