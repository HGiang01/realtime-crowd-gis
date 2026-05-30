import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Introduction from "./page/Introduction";
import Login from "./page/Login";
import Register from "./page/Register";
import SendOtp from "./page/SendOtp.tsx";
import ResetPassword from "./page/ResetPassword.tsx";
import VerifyEmail from "./page/VerifyEmail.tsx";
import EmailVerified from "./page/EmailVerified.tsx";
import NotFound from "./page/NotFound.tsx";

function App() {
	return (
		<BrowserRouter data-theme="light">
			<Routes>
				<Route
					path={"/"}
					element={<Introduction/>}/>
				<Route
					path={"/auth/login"}
					element={<Login/>}/>
				<Route
					path={"/auth/register"}
					element={<Register/>}/>
				<Route
					path={"/auth/verify-email"}
					element={<VerifyEmail/>}/>
				<Route
					path={"/auth/email-verified"}
					element={<EmailVerified/>}/>
				<Route
					path={"/auth/password/send-otp"}
					element={<SendOtp/>}/>
				<Route
					path={"/auth/password/reset"}
					element={<ResetPassword/>}/>

				<Route
					path={"*"}
					element={<NotFound/>}/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
