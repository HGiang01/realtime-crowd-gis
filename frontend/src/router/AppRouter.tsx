import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import {
    EmailVerifiedPage,
    LoginPage,
    RegisterPage,
    ResetPasswordPage,
    ForgotPasswordPage,
    VerifyEmailPage,
    OAuth2RedirectPage
} from "@/feature/auth";
import { UserPage, UpdateProfilePage, UpdatePasswordPage } from "@/feature/user";
import { HomePage, IntroductionPage, NotFoundPage } from "@/page";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/*Public routes*/ }
                <Route path={ "/" } element={ <IntroductionPage/> }/>
                <Route path={ "/auth/login" } element={ <LoginPage/> }/>
                <Route path={ "/auth/oauth2-redirect" } element={ <OAuth2RedirectPage/> }/>
                <Route path={ "/auth/register" } element={ <RegisterPage/> }/>
                <Route
                    path={ "/auth/verify-email" }
                    element={ <VerifyEmailPage/> }
                />
                <Route
                    path={ "/auth/email-verified" }
                    element={ <EmailVerifiedPage/> }
                />
                <Route
                    path={ "/auth/forgot-password" }
                    element={ <ForgotPasswordPage/> }
                />
                <Route
                    path={ "/auth/reset-password" }
                    element={ <ResetPasswordPage/> }
                />

                <Route path="/home" element={ <HomePage/> }/>

                {/*Private routes*/ }
                <Route element={ <ProtectedRoute/> }></Route>
                // todo: cho vào lại private pages
                <Route path={ "/user" } element={ <UserPage/> }/>
                <Route path={ "/user/edit" } element={ <UpdateProfilePage/> }/>
                <Route path={ "/user/password" } element={ <UpdatePasswordPage/> }/>

                <Route path={ "*" } element={ <NotFoundPage/> }/>
            </Routes>
        </BrowserRouter>
    );
}
