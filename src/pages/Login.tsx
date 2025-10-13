// src/pages/Login.tsx
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { validateEmail, validatePassword } from "../utils/validators";
import ThemeToggle from "../components/ThemeToggle";

const backgroundUrl =
  "https://res.cloudinary.com/dkt1t22qc/image/upload/v1742357451/Prestataires_Documents/cynbxx4vxvgv2wrpakiq.jpg";
const logoUrl =
  "https://res.cloudinary.com/dkt1t22qc/image/upload/v1742348949/Prestataires_Documents/smj7n1bdlpjsfsotwpco.png";

const Login: React.FC = () => {
  const isOnline = useNetworkStatus();
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOnline) {
      toast.error(
        "Aucune connexion Internet. Veuillez activer vos données mobiles ou le Wi-Fi pour continuer.",
        {
          position: "top-left",
          autoClose: 3000,
          hideProgressBar: false,
        }
      );
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Email invalide", { position: "top-left" });
      return;
    }
    if (!validatePassword(password)) {
      toast.error("Mot de passe trop court", { position: "top-left" });
      return;
    }

    await login(email, password);
  };

  return (
    <div
      className="bg-cover bg-center min-h-screen flex items-center justify-center relative"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
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
            Welcome Back!
          </h1>

          <input
            type="email"
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
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          {/* Sign up */}
          <p className="text-center text-[#969696] mt-2 text-sm">
            Don&apos;t have an account?{" "}
            <span className="cursor-pointer text-[#7337FF] hover:underline">
              Sign up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;






// ---------------------------------------------------------------------------------------------------------------------
// import { useNetworkStatus } from "../hooks/useNetworkStatus";
// import { toast } from "react-toastify";
// import { validateEmail, validatePassword } from "../utils/validators";
// import { useState } from "react";
// import { useAuth } from "../hooks/useAuth";
// import ThemeToggle from "../components/ThemeToggle";

// const Login = () => {
//   const isOnline = useNetworkStatus();

//   const { login, error, loading } = useAuth();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   // const handleSubmit  = async (e: React.FormEvent) => {
//   //   e.preventDefault();

//   //   if (!isOnline) {
//   //     toast.error("Aucune connexion Internet. Veuillez activer vos données mobiles ou le Wi-Fi pour continuer.", {
//   //       position: "top-left",
//   //       autoClose: 3000,
//   //       hideProgressBar: false,
//   //     });
//   //     return;
//   //   }

//   //   // sinon

//   //   if (!validateEmail(email)) return alert("Email invalide");
//   //   if (!validatePassword(password)) return alert("Mot de passe trop court");

//   //   await login(email, password);
//   // }

//   const backgroundUrl ="https://res.cloudinary.com/dkt1t22qc/image/upload/v1742357451/Prestataires_Documents/cynbxx4vxvgv2wrpakiq.jpg";
//   const logoUrl ="https://res.cloudinary.com/dkt1t22qc/image/upload/v1742348949/Prestataires_Documents/smj7n1bdlpjsfsotwpco.png";

//   return (
//     // <div className="h-screen bg-amber-100 dark:bg-blue-950">
//     //    <form onSubmit={handleSubmit}>
//     //     <h2>Connexion</h2>
//     //     <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
//     //     <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" />
//     //     <button type="submit" disabled={loading}>Se connecter</button>
//     //     {error && <p style={{ color: "red" }}>{error}</p>}
//     //   </form>
//     //   <ThemeToggle />
//     // </div>

//     <div
//       className="bg-cover bg-center min-h-screen"
//       style={{ backgroundImage: `url(${backgroundUrl})` }}
//     >
//       <div className="flex h-screen items-center justify-center">
//         <div className="flex flex-col items-center space-y-8">
//           {/* Logo */}
//           <div>
//             <img
//               src={logoUrl}
//               alt="TyBot Logo"
//               className="cursor-pointer w-32 md:w-40"
//             />
//           </div>

//           {/* Card */}
//           <div
//             className="w-80 rounded-[20px] bg-white p-8"
//             style={{ boxShadow: "#00000057 1px 3px 4px" }}
//           >
//             <h1
//               className="mb-4 text-center text-3xl font-bold text-black"
//               style={{ textShadow: "#00000063 0px 3px 5px" }}
//             >
//               Welcome Back !
//             </h1>

//             {/* Inputs */}
//             <div className="space-y-4">
//               <input
//                 type="text"
//                 placeholder="Email address"
//                 className="w-full rounded-md bg-[#E9EFF6] p-2.5 placeholder:text-[#000000]"
//                 style={{ boxShadow: "rgb(0 0 0 / 21%) 0px 7px 5px 0px" }}
//               />
//               <input
//                 type="password"
//                 placeholder="Password"
//                 className="w-full rounded-md bg-[#E9EFF6] p-2.5 placeholder:text-[#000000]"
//                 style={{ boxShadow: "rgb(0 0 0 / 21%) 0px 7px 5px 0px" }}
//               />
//             </div>

//             {/* Forget Password */}
//             <div className="mb-4 pt-2">
//               <span className="ml-2 cursor-pointer text-[10px] text-[#228CE0] hover:underline">
//                 Forget Password?
//               </span>
//             </div>

//             {/* Sign In Button */}
//             <div className="mb-4 flex justify-center">
//               <button className="h-10 w-full cursor-pointer rounded-md bg-gradient-to-br from-[#7336FF] to-[#3269FF] text-white shadow-md shadow-blue-950">
//                 Sign In
//               </button>
//             </div>

//             {/* Sign Up */}
//             {/* <div className="text-center text-[#969696]">
//               Don&apos;t have an account?{" "}
//               <span className="cursor-pointer text-[#7337FF] hover:underline">
//                 Sign up
//               </span>
//             </div> */}
//           </div>
//         </div>
//       </div>
//     </div>

//   )
// }

// export default Login;

