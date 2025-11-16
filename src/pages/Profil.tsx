

import UpdatePassword from "../components/UpdatePassword";
import { useAuth } from "../hooks/useAuth";

const Profil: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const avatarSeed = encodeURIComponent(user?.username || "user");

  return (
    user &&
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 py-10 px-4 transition-all duration-300">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300">
        <div className="flex items-center gap-6">
          <img
            src={`https://api.dicebear.com/9.x/croodles/svg?seed=${avatarSeed}`}
            alt="User avatar"
            className="w-24 h-24 rounded-full border border-gray-300 dark:border-gray-600 transition-all duration-300"
          />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">{user.username}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{user.email}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm transition-all duration-300">Type: {user.role}</span>
              <span className={`px-2 py-1 rounded-md text-sm transition-all duration-300 ${user.isValidated 
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
              }`}>
                {user?.isValidated ? 'Validated' : 'Pending validation'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 transition-all duration-300">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Account info</h3>
            <ul className="mt-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              {/* <li className="font-light"><strong>ID:</strong> {user && typeof user === 'object' ? user.id ?? '-' : 'unknown'}</li> */}
              <li className="font-light"><strong>Username:</strong><span className="text-pink-500 dark:text-pink-400"> {user && typeof user === 'object' ? user.username ?? '-' : 'unknown'}</span></li>
              <li className="font-light"><strong>Email:</strong> <span className="text-blue-400 dark:text-blue-300"> {user && typeof user === 'object' ? user.email ?? '-' : 'unknown'} </span></li>
            </ul>
          </div>
        </div>

        {
          user && typeof user === 'object' && user.id && user.username &&
          <>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
            <button className="btn  w-[50%] mt-3 bg-blue-600/20 hover:bg-blue-700/20 dark:bg-blue-500/20 dark:hover:bg-blue-600/20 text-gray-700 hover:text-gray-600 dark:hover:text-gray-200 dark:text-gray-200 border-gray-400 dark:border-blue-500 transition-all duration-300" onClick={() => document.getElementById('modal_' + user.username)?.showModal()}>Change password</button>
            <UpdatePassword u={user as any} self/>
          </>
        }
      </div>
    </div>
  );
}

export default Profil;