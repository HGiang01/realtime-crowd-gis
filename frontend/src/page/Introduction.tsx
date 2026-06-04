import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import intro from "../assets/intro.jpg";

export default function Introduction() {
	return (
		<div
			className="hero min-h-screen"
			style={{
				backgroundImage: `url(${intro})`,
			}}
		>
			<div className="hero-overlay"></div>
			<div className="hero-content text-neutral-content text-center">
				<div className="max-w-md">
					<h1 className="mb-5 text-5xl font-bold">GIS for Thu Duc</h1>
					<p className="mb-5">
						A real-time WebGIS platform for civil infrastructure
						management and crowdsourced incident reporting.
					</p>
					<Link to="/home">
						<button className="btn btn-lg btn-info btn-circle text-white">
							<ArrowRight/>
						</button>
					</Link>
				</div>
			</div>
			<div className="absolute bottom-8 left-0 right-0 text-center text-sm text-wg-primary-soft">
				Do you have an account?{" "}
				<Link to="/auth/login">
					<button
						className="font-semibold hover:underline"
						type="button"
					>
						Sign in now
					</button>
				</Link>
			</div>
		</div>
	);
}
