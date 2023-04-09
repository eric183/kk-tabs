import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

const setPageBackgroundColor = () => {
  chrome.storage.sync.get("color", ({ color }) => {
    chrome.storage.sync.get("templateStr", ({ templateStr }) => {
      document.body.insertAdjacentHTML("beforeend", templateStr);
    });
  });
};

function PicsD() {
  useEffect(() => {
    const m = document.querySelector(".pic-list-design");
    console.log(m);
  }, []);
  return (
    <div
      className="pic-list-design"
      style={{
        background: "red",
        width: "500px",
        height: "100vh",
        position: "fixed",
        top: "0",
        right: "0",
        zIndex: "9999",
      }}
    ></div>
  );
}

function App() {
  const [value, setValue] = useState<string>("");

  const init = async () => {
    const emailInfo = await chrome.storage.sync.get("email");
    setValue(emailInfo.email);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div
      style={{
        borderRadius: "10px",
        padding: "12px 18px",
        fontSize: 13,
        color: "#166534",
      }}
    >
      {/* <div>Input your email below</div> */}
      <input
        type="text"
        value={value}
        id="changeContent"
        style={{
          margin: "10px 0",
          // border: "0 solid #e5e7eb",
          padding: "5px 10px",
          color: "#166534",
          border: "2px solid #166534",
        }}
        placeholder="Input your email"
        onInput={(evt) => {
          setValue((evt.target as HTMLInputElement).value);
        }}
      />
      <button
        id="changeColor"
        onClick={(evt) => {
          setValue(value);
          console.log(value);
          chrome.storage.sync.set({
            email: value,
          });
          (evt.target as HTMLButtonElement).textContent = "Applied";
        }}
        style={{
          border: "2px solid #166534",
          background: "#fff",
          color: "#166534",
          fontSize: "13px",
          padding: "5px 8px",
          borderRadius: "6px",
          lineHeight: "normal",
        }}
      >
        Apply
      </button>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);

root.render(<App />);
