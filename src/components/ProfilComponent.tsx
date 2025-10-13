
const ProfilComponent = () => {
  return (
  <div className="flex items-center justify-center min-h-screen p-4">
    <div className="max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-purple-500 to-indigo-600 relative">
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <img className="h-24 w-24 rounded-full border-4 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80" alt="Profile picture" />
        </div>
        </div>
        {/* Profile Info */}
        <div className="pt-16 pb-8 px-6 text-center">
        <h3 className="text-xl font-bold text-gray-800">Sarah Johnson</h3>
        <p className="text-indigo-600 font-medium">Senior Product Designer</p>
        <p className="text-gray-500 mt-2">Creating user-centered designs that solve real problems. Passionate about accessibility and inclusive design.</p>
        {/* Stats */}
        <div className="flex justify-center space-x-6 mt-6">
            <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">142</p>
            <p className="text-sm text-gray-500">Projects</p>
            </div>
            <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">24.5K</p>
            <p className="text-sm text-gray-500">Followers</p>
            </div>
            <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">562</p>
            <p className="text-sm text-gray-500">Following</p>
            </div>
        </div>
        {/* Contact Buttons */}
        <div className="mt-8 flex justify-center space-x-3">
            <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out">
            Follow
            </button>
            <button className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out">
            Message
            </button>
        </div>
        {/* Social Links */}
        <div className="mt-8 flex justify-center space-x-5">
            <a href="#" className="text-gray-400 hover:text-indigo-500 transition-colors duration-200">
            <i className="fab fa-twitter text-xl" />
            </a>
            <a href="#" className="text-gray-400 hover:text-indigo-500 transition-colors duration-200">
            <i className="fab fa-linkedin-in text-xl" />
            </a>
            <a href="#" className="text-gray-400 hover:text-indigo-500 transition-colors duration-200">
            <i className="fab fa-dribbble text-xl" />
            </a>
            <a href="#" className="text-gray-400 hover:text-indigo-500 transition-colors duration-200">
            <i className="fab fa-github text-xl" />
            </a>
            <a href="#" className="text-gray-400 hover:text-indigo-500 transition-colors duration-200">
            <i className="fab fa-instagram text-xl" />
            </a>
        </div>
        </div>
        {/* Skills */}
        <div className="px-6 pb-8">
        <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm font-medium rounded-full">UI/UX</span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm font-medium rounded-full">Figma</span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm font-medium rounded-full">Prototyping</span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm font-medium rounded-full">Wireframing</span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm font-medium rounded-full">User Research</span>
        </div>
        </div>
    </div>
    </div>
  );

}

export default ProfilComponent;