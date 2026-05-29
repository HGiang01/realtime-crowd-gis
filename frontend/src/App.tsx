import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Introduction from "./page/Introduction";
import Login from "./page/Login";
import Register from "./page/Register";

function App() {
    return (
        <BrowserRouter data-theme="light">
            <Routes>
                <Route path={"/"} element={<Introduction />} />
                <Route path={"/login"} element={<Login />} />
                <Route path={"/register"} element={<Register />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
