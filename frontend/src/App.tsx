import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Introduction from "./page/Introduction";

function App() {
    return (
        <BrowserRouter data-theme="light">
            <Routes>
                <Route path={"/"} element={<Introduction />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
