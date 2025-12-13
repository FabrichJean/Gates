import UpdatePassword from "../components/UpdatePassword";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Shield, 
  CheckCircle, 
  Clock,
  Lock,
  Edit,
  Camera
} from "lucide-react";

const Profil: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const avatarSeed = encodeURIComponent(user?.username || "user");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        {/* Profile Header Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-8"
        >
          {/* Background Gradient Header */}
          <div className="h-32 bg-gradient-to-r relative">
            <div className="absolute inset-0 bg-black/20" />
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="absolute bottom-4 right-4"
            >
              <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200">
                <Camera className="w-5 h-5 text-white" />
              </button>
            </motion.div>
          </div>

          {/* Profile Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16">
              {/* Avatar with ring effect */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 shadow-2xl overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/9.x/open-peeps/svg?seed=${avatarSeed}`}
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left sm:mt-12">
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-gray-900 dark:text-gray-100"
                >
                  {user.username}
                </motion.h1>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center sm:justify-start gap-2 mt-2"
                >
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {user.email}
                  </span>
                </motion.div>

                {/* Status Badges */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start"
                >
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                    <Shield className="w-3 h-3" />
                    {user.role}
                  </span>
                  
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                      user.isValidated
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                    }`}
                  >
                    {user.isValidated ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Validated
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        Pending validation
                      </>
                    )}
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Details Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Details
            </h2>
          </div>

          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-all duration-200"
              >
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Basic Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Username</span>
                    <span className="text-sm font-medium text-pink-500 dark:text-pink-400">{user.username}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                    <span className="text-sm font-medium text-blue-500 dark:text-blue-400">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">User ID</span>
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{user.id}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-all duration-200"
              >
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Security</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Role</span>
                    <span className="text-sm font-medium text-purple-500 dark:text-purple-400">{user.role}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <span className={`text-sm font-medium ${
                      user.isValidated 
                        ? "text-green-500 dark:text-green-400" 
                        : "text-yellow-500 dark:text-yellow-400"
                    }`}>
                      {user.isValidated ? "Validated" : "Pending"}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  (document.getElementById("modal_" + user.username) as HTMLDialogElement)?.showModal()
                }
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow border hover:shadow-lg cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Change Password
              </motion.button>
            </motion.div>

            {/* Modal */}
            <UpdatePassword u={user as any} self />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profil;