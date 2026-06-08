import { Link } from "react-router-dom";
import { Mail, Search, User } from "lucide-react";

export default function Header() {
    return (
        <header className="relative z-10 text-sm text-on-wg-surface-variant">
            <div
                className="flex items-center gap-4 border border-wg-outline-variant/80 bg-wg-surface-container-lowest px-4 py-3 shadow-[0_6px_20px_rgba(15,23,42,0.06)] backdrop-blur-md">
                <Link to="/home" className="shrink-0">
                    <img src="/icon-1.png" alt="Logo" className="size-10"/>
                </Link>

                <label
                    className="flex h-12 min-w-0 flex-[0_1_50rem] items-center gap-3 rounded-[1.25rem] border border-wg-outline-variant/70 bg-wg-surface px-4 transition focus-within:border-wg-primary/40 focus-within:bg-wg-surface-container-lowest focus-within:shadow-[0_8px_20px_rgba(0,91,191,0.08)]"
                    aria-label="Search places or projects"
                >
                    <Search className="h-4 w-4 shrink-0 text-wg-primary/70"/>
                    <input
                        type="search"
                        name="search"
                        placeholder="Tìm kiếm địa điểm, công trình..."
                        className="w-full min-w-0 border-0 bg-transparent text-sm text-on-wg-surface outline-none placeholder:text-on-wg-surface-variant/70"
                    />
                </label>

                <div className="ml-auto flex shrink-0 items-center gap-4 pl-4">
                    <button
                        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-on-wg-surface-variant transition hover:bg-wg-surface"
                        type="button"
                        aria-label="Messages"
                    >
                        <Mail className="h-5 w-5"/>
                        <span
                            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-wg-error ring-2 ring-wg-surface-container-lowest"/>
                    </button>

                    <div
                        className="h-10 w-px bg-wg-outline-variant/70"
                        aria-hidden="true"
                    />

                    <Link to="/user">
                        <User/>
                    </Link>
                </div>
            </div>
        </header>
    );
}
