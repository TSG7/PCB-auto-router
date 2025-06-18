
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-emerald-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
