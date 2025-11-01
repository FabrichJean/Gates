const VideoTableHeader = () => {
  return (
    <thead className="bg-gray-50 text-gray-600 uppercase">
      <tr>
        <th className="py-3 px-6 text-left">Ref</th>
        <th className="py-3 px-6 text-left">Username</th>
        <th className="py-3 px-6 text-left">Category</th>
        <th className="py-3 px-6 text-left">Status</th>
        <th className="py-3 px-6 text-center">Cover</th>
        <th className="py-3 px-6 text-center">Duration</th>
        <th className="py-3 px-6 text-left">Activate</th>
        <th className="py-3 px-6 text-center">Checking</th>
        <th className="py-3 px-6 text-center">Actions</th>
        <th className="py-3 px-6 text-center">Date</th>
      </tr>
    </thead>
  );
};

export default VideoTableHeader;