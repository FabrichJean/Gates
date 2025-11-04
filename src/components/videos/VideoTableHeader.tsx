const VideoTableHeader = () => {
  return (
    <thead className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-gray-600 dark:text-gray-300 uppercase transition-colors duration-300">
      <tr>
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">Ref</th>
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">Username</th>
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">Category</th>
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">Status</th>
        <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">Cover</th>
        <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">Duration</th>
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">Activate</th>
        <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">Checking</th>
        <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">Actions</th>
        <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">Date</th>
      </tr>
    </thead>
  );
};

export default VideoTableHeader;