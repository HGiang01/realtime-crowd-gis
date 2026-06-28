import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import {
    EmailVerifiedPage,
    ForgotPasswordPage,
    LoginPage,
    OAuth2RedirectPage,
    RegisterPage,
    ResetPasswordPage,
    VerifyEmailPage,
} from "@/feature/auth";
import { UpdatePasswordPage, UpdateProfilePage, UserPage, } from "@/feature/user";
import { HomePage, IntroductionPage, NotFoundPage } from "@/page";
import * as reportPages from "@/feature/report";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AppRouter() {
    const {getMe, isAuthenticated, user} = useAuthStore();
    useEffect(() => {
        if (isAuthenticated && user) return;

        (async () => {
            await getMe();
        })();
    }, []);
    return (
        <BrowserRouter>
            <Routes>
                {/*Public routes*/}
                <Route path={"/"} element={<IntroductionPage />} />
                <Route path={"/auth/login"} element={<LoginPage />} />
                <Route
                    path={"/auth/oauth2-redirect"}
                    element={<OAuth2RedirectPage />}
                />
                <Route path={"/auth/register"} element={<RegisterPage />} />
                <Route
                    path={"/auth/verify-email"}
                    element={<VerifyEmailPage />}
                />
                <Route
                    path={"/auth/email-verified"}
                    element={<EmailVerifiedPage />}
                />
                <Route
                    path={"/auth/forgot-password"}
                    element={<ForgotPasswordPage />}
                />
                <Route
                    path={"/auth/reset-password"}
                    element={<ResetPasswordPage />}
                />
                <Route path="/home" element={<HomePage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path={"/user"} element={<UserPage />} />
                    <Route
                        path={"/user/edit"}
                        element={<UpdateProfilePage />}
                    />
                    <Route
                        path={"/user/password"}
                        element={<UpdatePasswordPage />}
                    />
                </Route>

                {/*User routes*/}
                <Route element={<ProtectedRoute requiredRole="user" />}>
                    <Route
                        path={"/my-reports/locations"}
                        element={<reportPages.UserLocationListPage />}
                    />

                    <Route
                        path={"/location-reports/create"}
                        element={<reportPages.UserLocationCreatePage />}
                    />

                    <Route
                        path={"/location-reports/create/:id"}
                        element={<reportPages.UserLocationCreatePage />}
                    />
                    
                    <Route
                        path={"/location-reports/:id"}
                        element={<reportPages.UserLocationDetailPage />}
                    />

                    <Route
                        path={"/my-reports/incidents"}
                        element={<reportPages.UserIncidentListPage />}
                    />

                    <Route
                        path={"/incident-reports/create"}
                        element={<reportPages.UserIncidentCreatePage />}
                    />

                    <Route
                        path={"/incident-reports/:id"}
                        element={<reportPages.UserIncidentDetailPage />}
                    />
                </Route>

                {/*Admin routes*/}
                <Route element={<ProtectedRoute requiredRole="admin" />}>
                    <Route
                        path={"/admin/location-reports"}
                        element={<reportPages.AdminLocationListPage />}
                    />

                    <Route
                        path={"/admin/location-reports/:id/review"}
                        element={<reportPages.AdminLocationReviewPage />}
                    />

                    <Route
                        path={"/admin/incident-reports"}
                        element={<reportPages.AdminIncidentListPage />}
                    />

                    <Route
                        path={"/admin/incident-reports/:id/review"}
                        element={<reportPages.AdminIncidentReviewPage />}
                    />

                    <Route
                        path={"/admin/location-reports/pending"}
                        element={<reportPages.AdminLocationPendingPage />}
                    />

                    <Route
                        path={"/admin/incident-reports/pending"}
                        element={<reportPages.AdminIncidentPendingPage />}
                    />
                </Route>

                <Route path={"*"} element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}
