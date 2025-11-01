import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { validatePassword } from "../utils/validators";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

const backgroundUrl =
  "https://res.cloudinary.com/dkt1t22qc/image/upload/v1742357451/Prestataires_Documents/cynbxx4vxvgv2wrpakiq.jpg";
const logoUrl =
  "https://res.cloudinary.com/dkt1t22qc/image/upload/v1742348949/Prestataires_Documents/smj7n1bdlpjsfsotwpco.png";

const Login: React.FC = () => {
  const { login, error, loading, token, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Verifier si l'utilisateur est deja connecté et rediger vers la page d'accueil "/"
  useEffect(() => {
    if (loading) return;

    if (!token && !user) return;

    // If the user is present and not validated, send them to login page
    if (user && typeof user === 'object' && user.isValidated === false) {
      navigate("/login");
      return;
    }

    // otherwise, go to home
    if (token) navigate("/");
  }, [token, user, loading, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      toast.error("Mot de passe trop court");
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Erreur lors de la connexion');
    }

  };

  return (
    <div
      className="bg-cover bg-center min-h-screen flex items-center justify-center relative"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <Toaster />
      <div className="flex flex-col items-center space-y-8">
        <img src="/img static/logo login.png" alt="TyBot Logo" className="w-32 md:w-40 cursor-pointer" />
        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="w-100 rounded-[20px] bg-white/10 p-8 flex flex-col space-y-4 backdrop-blur-lg border border-white/20 shadow-2xl"
        >
          <h1 className="font-sans text-3xl font-bold text-center mb-4 text-white antialiased tracking-wide">Login</h1>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="font-sans w-full rounded-sm bg-transparent p-2.5 placeholder:text-white text-white font-medium border border-white antialiased transition-all focus:border-white/80 focus:bg-white/5"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="font-sans w-full rounded-sm bg-transparent p-2.5 pr-12 placeholder:text-white text-white font-medium border border-white antialiased transition-all focus:border-white/80 focus:bg-white/5"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                  <line x1="2" y1="2" x2="22" y2="22"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          {/* Forget password */}
          <span className="font-sans text-[12px] text-[#228CE0] cursor-pointer hover:underline ml-1 font-medium antialiased transition-colors hover:text-blue-300">
            Forget Password?
          </span>
          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="font-sans h-10 w-full cursor-pointer mt-2 rounded-sm bg-gradient-to-br from-[#7336FF] to-[#3269FF] text-white shadow-md shadow-blue-950 disabled:opacity-50 font-semibold antialiased tracking-wide transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? "Loading..." : "Sign In"}
          </button>

          {/* Sign up */}
          <p className="font-sans text-center text-gray-200 mt-2 text-sm antialiased">
            Don&apos;t have an account?{" "}
            <span className="font-sans cursor-pointer text-teal-500 hover:underline font-semibold antialiased transition-colors hover:text-teal-300">
              <Link to={"/register"}>
                Sign up
              </Link>
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
