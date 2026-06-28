import { WebSocketProvider } from "@/api";
import "./App.css";
import AppRouter from "./router/AppRouter.tsx";

function App() {
    return (
        <WebSocketProvider>
            <AppRouter />
        </WebSocketProvider>
    );
}

export default App;
