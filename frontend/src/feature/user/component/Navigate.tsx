import { ArrowLeft, Key, LogOut, Pencil, User as UserIcon } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore.ts";

export default function Navigate() {
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const navItems = [
        { path: "/user", icon: UserIcon, label: "User information", end: true },
        { path: "/user/edit", icon: Pencil, label: "Update profile" },
        { path: "/user/password", icon: Key, label: "Change password" },
    ];

    const handleLogout =async () => {
        await logout();
        navigate("/auth/login");
    }
    return (
        <nav
            className="col-span-2 fade-up flex flex-col justify-between rounded-3xl border border-wg-outline-variant bg-wg-surface-container-lowest p-8 shadow-(--shadow-wg-ambient)"
            style={{ animationDelay: "360ms" }}
        >
            <div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) =>
                            `inline-flex w-full items-center justify-center px-4 py-3 text-sm font-medium rounded-2xl mb-2 border transition-colors ${
                                isActive
                                    ? "border-transparent bg-wg-primary text-on-wg-primary hover:bg-wg-primary-container"
                                    : "border-wg-primary bg-transparent text-wg-primary hover:bg-wg-primary/10"
                            }`
                        }
                    >
                        <item.icon className="size-4" />
                        <span className="flex-1 text-center">{item.label}</span>
                    </NavLink>
                ))}
            </div>
            <div>
                <button
                    onClick={handleLogout}
                    className="inline-flex w-full items-center justify-center px-4 py-3 text-sm font-medium rounded-2xl mb-2 border border-transparent bg-wg-error text-on-wg-error hover:bg-wg-error/80"
                >
                    <LogOut className="mr-2 size-4" />
                    <span className="flex-1 text-center">Logout</span>
                </button>

                <Link
                    to="/home"
                    className="inline-flex w-full items-center justify-center px-4 py-3 text-sm font-medium rounded-2xl border border-transparent bg-wg-surface-container text-on-wg-surface hover:bg-wg-outline-variant hover:text-black transition-colors"
                >
                    <ArrowLeft className="size-4" />
                    <span className="flex-1 text-center">Back to home</span>
                </Link>
            </div>
        </nav>
    );
}