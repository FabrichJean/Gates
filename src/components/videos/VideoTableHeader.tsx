interface VideoTableHeaderProps {
  showSelection?: boolean;
}

const VideoTableHeader = ({ showSelection = false }: VideoTableHeaderProps) => {
  return (
    <thead className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-gray-600 dark:text-gray-300 uppercase transition-colors duration-300">
      <tr>
        {showSelection && (
          <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs">选择</span>
          </th>
        )}
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">
          参考
        </th>
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">
          用户名
        </th>
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">
          创建者
        </th>
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">
          类别
        </th>
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">
          状态
        </th>
        <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">
          封面
        </th>
        <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">
          时长
        </th>
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">
          激活
        </th>
        <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">
          检查
        </th>
        <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">
          操作
        </th>
        <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">
          日期
        </th>
      </tr>
    </thead>
  );
};

export default VideoTableHeader;
