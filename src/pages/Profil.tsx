

import { useAuth } from "../hooks/useAuth";

const Profil: React.FC = () => {
  const { user, token } = useAuth();

  // derive fields
  let displayName = "Admin";
  let email = "unknown";
  let role = "unknown";
  let isValidated = false;

  if (user) {
    if (typeof user === "string") {
      role = user;
      displayName = user;
    } else if (typeof user === "object") {
      displayName = user.name || user.username || user.email || "User";
      email = user.email || "-";
      role = user.role ?? user.userType ?? "-";
      isValidated = Boolean(user.isValidated);
    }
  }

  const avatarSeed = encodeURIComponent(displayName || "user");

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-6">
          <img
            src={`https://api.dicebear.com/9.x/croodles/svg?seed=${avatarSeed}`}
            alt="User avatar"
            className="w-24 h-24 rounded-full border"
          />
          <div>
            <h2 className="text-2xl font-semibold">{displayName}</h2>
            <p className="text-sm text-gray-500">{email}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-sm">Type: {role}</span>
              <span className={`px-2 py-1 rounded-md text-sm ${isValidated ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                {isValidated ? 'Validated' : 'Pending validation'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* <div className="p-4 border rounded-md">
            <h3 className="text-sm text-gray-500">Token</h3>
            <p className="text-xs break-all mt-2 text-gray-700">{token || '-'}</p>
          </div> */}

          <div className="p-4 border rounded-md">
            <h3 className="text-sm text-gray-500">Account info</h3>
            <ul className="mt-2 text-gray-700">
              <li><strong>ID:</strong> {user && typeof user === 'object' ? user.id ?? '-' : '-'}</li>
              <li><strong>Username:</strong> {user && typeof user === 'object' ? user.username ?? '-' : '-'}</li>
              <li><strong>Email:</strong> {email}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profil;