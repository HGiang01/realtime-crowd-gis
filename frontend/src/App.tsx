import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Introduction from "./page/Introduction";
import Login from "./page/Login";

function App() {
    return (
        <BrowserRouter data-theme="light">
            <Routes>
                <Route path={"/"} element={<Introduction />} />
                <Route path={"/login"} element={<Login />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
