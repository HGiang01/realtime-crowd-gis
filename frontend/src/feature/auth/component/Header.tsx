import { useRef } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, MapPinned } from "lucide-react";

export default function Header() {
    const modalRef = useRef<HTMLDialogElement | null>(null);
    const openModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    return (
        <header className="relative z-10 flex items-center justify-between px-8 pt-6 text-sm text-on-wg-surface-variant">
            <Link to="/home">
                <div className="flex items-center gap-2">
                    <MapPinned className="h-4 w-4 text-wg-primary" />
                    <span className="font-label">Digital Map of Thu Duc</span>
                </div>
            </Link>
            <button
                className="inline-flex items-center gap-2 rounded-full border border-wg-outline-variant px-3 py-1 text-xs text-on-wg-surface-variant hover:text-on-wg-surface cursor-pointer"
                type="button"
                onClick={openModal}
            >
                <HelpCircle className="h-4 w-4" />
                Help
            </button>

            <dialog ref={modalRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Need Help?</h3>
                    <p className="py-4">
                        Something not working as expected? Please contact us an
                        email at <b>support@gmail.com</b> and we'll help you out
                        as soon as we can!
                    </p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </header>
    );
}
