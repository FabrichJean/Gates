// src/pages/Register.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { validateEmail, validatePassword } from "../utils/validators";
import { useNavigate, Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

const backgroundUrl =
  "https://res.cloudinary.com/dkt1t22qc/image/upload/v1742357451/Prestataires_Documents/cynbxx4vxvgv2wrpakiq.jpg";
const logoUrl =
  "https://res.cloudinary.com/dkt1t22qc/image/upload/v1742348949/Prestataires_Documents/smj7n1bdlpjsfsotwpco.png";

const Register: React.FC = () => {
  const isOnline = useNetworkStatus();
  const { register, loading, token, user } = useAuth(); // ✅ On utilise register ici
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  // Verifier si l'utilisateur est deja connecté et rediger vers la page d'accueil "/"
    useEffect(() => {
      if (token || user) {
        navigate("/"); // redirige vers l’accueil
      }
    }, [token, user, navigate]);

  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOnline) {
      toast.error(
        "Aucune connexion Internet. Veuillez activer vos données mobiles ou le Wi-Fi pour continuer.");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Email invalide Reg", { position: "top-center" });
      return;
    }
    if (!validatePassword(password)) {
      toast.error("Mot de passe trop court", { position: "top-center" });
      return;
    }
  
    if (password !== confirmPassword) {
      // alert("Les mots de passe ne correspondent pas.");
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    await register(username, email, password)
    .then(() => {
      navigate("/register");
    })
    .catch((err) => {
     toast.error("Login faild" +  err.message);
    });
  };

  return (
    <div
      className="bg-cover bg-center min-h-screen flex items-center justify-center relative"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <Toaster />
      <div className="flex flex-col items-center space-y-8">
        <img src={logoUrl} alt="App Logo" className="w-32 md:w-40 cursor-pointer" />

        <form
          onSubmit={handleSubmitRegister}
          className="w-80 rounded-[20px] bg-white p-8 flex flex-col space-y-4"
          style={{ boxShadow: "#00000057 1px 3px 4px" }}
        >
          <h1
            className="text-3xl font-bold text-center mb-4 text-black"
            style={{ textShadow: "#00000063 0px 3px 5px" }}
          >
            Register
          </h1>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full rounded-md bg-[#E9EFF6] p-2.5 placeholder:text-[#000000]"
            style={{ boxShadow: "rgb(0 0 0 / 21%) 0px 7px 5px 0px" }}
          />

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

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full rounded-md bg-[#E9EFF6] p-2.5 placeholder:text-[#000000]"
            style={{ boxShadow: "rgb(0 0 0 / 21%) 0px 7px 5px 0px" }}
          />

          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full cursor-pointer mt-2 rounded-md bg-gradient-to-br from-[#7336FF] to-[#3269FF] text-white shadow-md shadow-blue-950 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>

          {/* {error && <p className="text-red-500 text-sm mt-2">{error}</p>} */}

          <p className="text-center text-[#969696] mt-2 text-sm">
            Already have an account?{" "}
            <span className="cursor-pointer text-[#7337FF] hover:underline">
              <Link to={"/login"}>
                Sign up
              </Link>
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
