// src/pages/Login.tsx
import { useState, useEffect } from "react";
// import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { validatePassword } from "../utils/validators";
import ThemeToggle from "../components/ThemeToggle";
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
  const navigate = useNavigate();

  // Verifier si l'utilisateur est deja connecté et rediger vers la page d'accueil "/"
  useEffect(() => {
    // wait until auth loading settles to avoid navigating when token is set but user object not yet populated
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

    // if (!isOnline) {
    //   toast.error("Aucune connexion Internet. Veuillez activer vos données mobiles ou le Wi-Fi pour continuer.");
    //   return;
    // }

    if (!validatePassword(password)) {
      toast.error("Mot de passe trop court");
      return;
    }

    // if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    //   toast.error("Email invalide ou manquant.");
    //   return;
    // }

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
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center space-y-8">
        {/* Logo */}
        <img src={logoUrl} alt="TyBot Logo" className="w-32 md:w-40 cursor-pointer" />

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="w-80 rounded-[20px] bg-white p-8 flex flex-col space-y-4"
          style={{ boxShadow: "#00000057 1px 3px 4px" }}
        >
          <h1
            className="text-3xl font-bold text-center mb-4 text-black"
            style={{ textShadow: "#00000063 0px 3px 5px" }}
          >
            Login
          </h1>

          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full rounded-md bg-[#E9EFF6] p-2.5 placeholder:text-[#000000]"
            style={{ boxShadow: "rgb(0 0 0 / 21%) 0px 7px 5px 0px" }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md bg-[#E9EFF6] p-2.5 placeholder:text-[#000000]"
            style={{ boxShadow: "rgb(0 0 0 / 21%) 0px 7px 5px 0px" }}
          />

          {/* Forget password */}
          <span className="text-[10px] text-[#228CE0] cursor-pointer hover:underline ml-1">
            Forget Password?
          </span>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full cursor-pointer mt-2 rounded-md bg-gradient-to-br from-[#7336FF] to-[#3269FF] text-white shadow-md shadow-blue-950 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Sign In"}
          </button>

          {/* Error message */}
          {/* {error && <p className="text-red-500 text-sm mt-2">{error}</p>} */}

          {/* Sign up */}
          <p className="text-center text-[#969696] mt-2 text-sm">
            Don&apos;t have an account?{" "}
            <span className="cursor-pointer text-[#7337FF] hover:underline">
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
