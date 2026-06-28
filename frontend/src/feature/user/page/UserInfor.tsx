import Header from "@/component/Header.tsx";
import Navigate from "../component/Navigate.tsx";
import { useAuthStore } from "@/store";

export default function User() {
    const { user } = useAuthStore();

    return (
        <div className="flex flex-col relative min-h-screen overflow-hidden bg-wg-background text-on-wg-background">
            <style>{`
                @keyframes fade-up {
                    0% { opacity: 0; transform: translateY(16px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .fade-up { animation: fade-up 600ms ease-out both; }
            `}</style>

            {/* Background trang trí (Chỉ hiện trên Desktop để Mobile không bị giật lag) */}
            <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-wg-primary-soft blur-3xl hidden lg:block" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-wg-primary-container/30 blur-3xl hidden lg:block" />

            <Header />

            {/* Đổi từ Grid sang Flex để dễ kiểm soát độ rộng của Sidebar */}
            <main className="flex-1 relative z-10 w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
                {/* 🌟 Cột Sidebar (Navigate) */}
                {/* Trên mobile nó sẽ nằm trên cùng, trên Desktop nó sẽ bị khóa độ rộng ở 280px */}
                <div
                    className="w-full lg:w-[280px] shrink-0 fade-up"
                    style={{ animationDelay: "200ms" }}
                >
                    <Navigate />
                </div>

                {/* 🌟 Cột Nội dung chính (Thông tin User) */}
                <section
                    className="flex-1 min-w-0 fade-up flex flex-col rounded-3xl border border-wg-outline-variant bg-wg-surface-container-lowest p-6 sm:p-8 shadow-sm"
                    style={{ animationDelay: "400ms" }}
                >
                    {/* Phần: Basic Information */}
                    <div className="flex flex-col gap-5 mb-10">
                        {/* Header của section & Nhãn Role (Gắn liền với nhau bằng flex, không dùng absolute nữa) */}
                        <div className="flex items-center justify-between border-b border-wg-outline-variant/50 pb-3">
                            <h3 className="text-xl font-bold text-gray-800">
                                Basic Information
                            </h3>
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100">
                                {user?.role || "User"}
                            </span>
                        </div>

                        {/* Lưới thông tin (Thiết kế dạng thẻ card nhỏ) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                                    Username
                                </h2>
                                <p
                                    className="text-[15px] font-medium text-gray-900 truncate"
                                    title={user?.username}
                                >
                                    {user?.username || "N/A"}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                                    Date of birth
                                </h2>
                                <p className="text-[15px] font-medium text-gray-900 truncate">
                                    {user?.dob || "N/A"}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                                    Email
                                </h2>
                                <p
                                    className="text-[15px] font-medium text-gray-900 truncate"
                                    title={user?.email}
                                >
                                    {user?.email || "N/A"}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                                    Phone
                                </h2>
                                <p className="text-[15px] font-medium text-gray-900 truncate">
                                    {user?.phone || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Phần: Contribution Summary */}
                    <div className="flex flex-col gap-5">
                        <div className="border-b border-wg-outline-variant/50 pb-3">
                            <h3 className="text-xl font-bold text-gray-800">
                                Contribution Summary
                            </h3>
                        </div>

                        {/* Lưới Thống kê (Đổi style sang nền nhạt, số to, nhìn cực kỳ chuyên nghiệp) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Khối 1: Earned points */}
                            <div className="flex flex-col justify-center items-center p-6 rounded-3xl bg-green-50 border border-green-100 shadow-sm transition-transform hover:-translate-y-1">
                                <p className="text-4xl font-black text-green-600 mb-2">
                                    0
                                </p>
                                <h2 className="text-xs font-bold text-green-700/70 uppercase tracking-widest text-center">
                                    Earned points
                                </h2>
                            </div>

                            {/* Khối 2: Reports contributed */}
                            <div className="flex flex-col justify-center items-center p-6 rounded-3xl bg-gray-50 border border-gray-200 shadow-sm transition-transform hover:-translate-y-1">
                                <p className="text-4xl font-black text-gray-700 mb-2">
                                    0
                                </p>
                                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">
                                    Reports contributed
                                </h2>
                            </div>

                            {/* Khối 3: Reports processed */}
                            <div className="flex flex-col justify-center items-center p-6 rounded-3xl bg-blue-50 border border-blue-100 shadow-sm transition-transform hover:-translate-y-1">
                                <p className="text-4xl font-black text-blue-600 mb-2">
                                    0
                                </p>
                                <h2 className="text-xs font-bold text-blue-700/70 uppercase tracking-widest text-center">
                                    Reports processed
                                </h2>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
