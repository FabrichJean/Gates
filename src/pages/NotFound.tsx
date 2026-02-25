import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="text-center animate-fadeIn">
        <img src="https://yemca-services.net/404.png" alt="404 Illustration" className="mx-auto w-80 animate-[float_3s_infinite] shadow-xl rounded-lg" />
        <h1 className="text-5xl font-extrabold text-blue-700 mt-6 mb-6">看起来你迷路了！</h1>
        <Link
            to="/"
            className="inline-block px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            返回首页
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
