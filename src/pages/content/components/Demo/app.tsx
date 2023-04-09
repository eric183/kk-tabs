import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    console.log("content view loaded.....asdfafsd");
  }, []);

  return <div className="content-view text-red-600">content view</div>;
}
