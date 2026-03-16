import { useI18n } from "../../i18n";

interface VideoTableHeaderProps {
  showSelection?: boolean;
}

const VideoTableHeader = ({ showSelection = false }: VideoTableHeaderProps) => {
  const { t } = useI18n();

  return (
    <thead className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-gray-600 dark:text-gray-300 uppercase transition-colors duration-300">
      <tr>
        {showSelection && (
          <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs">{t("videos.table.select")}</span>
          </th>
        )}
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">
          {t("videos.table.reference")}
        </th>
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">
          {t("videos.table.username")}
        </th>
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">
          {t("videos.table.creator")}
        </th>
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">
          {t("videos.table.category")}
        </th>
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">
          {t("videos.table.status")}
        </th>
        <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">
          {t("videos.table.cover")}
        </th>
        <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">
          {t("videos.table.duration")}
        </th>
        <th className="py-3 px-6 text-left border-b border-gray-200 dark:border-gray-700">
          {t("videos.table.active")}
        </th>
        <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">
          {t("videos.table.check")}
        </th>
        <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">
          {t("videos.table.actions")}
        </th>
        <th className="py-3 px-6 text-center border-b border-gray-200 dark:border-gray-700">
          {t("videos.table.date")}
        </th>
      </tr>
    </thead>
  );
};

export default VideoTableHeader;
