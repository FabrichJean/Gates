import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { toast } from "react-toastify";
import { validateEmail, validatePassword } from "../utils/validators";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import ThemeToggle from "../components/ThemeToggle";

const Login = () => {
  const isOnline = useNetworkStatus();

  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit  = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOnline) {
      toast.error("Aucune connexion Internet. Veuillez activer vos données mobiles ou le Wi-Fi pour continuer.", {
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
      });
      return;
    }

    // sinon

    if (!validateEmail(email)) return alert("Email invalide");
    if (!validatePassword(password)) return alert("Mot de passe trop court");

    await login(email, password);
  }


  return (
    <div className="h-screen bg-amber-100 dark:bg-blue-950">
       <form onSubmit={handleSubmit}>
        <h2>Connexion</h2>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" />
        <button type="submit" disabled={loading}>Se connecter</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
      <ThemeToggle />
    </div>
  )
}

export default Login;
