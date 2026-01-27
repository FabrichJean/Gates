import { useState } from "react";
import { Check, X, AlertTriangle, ChevronDown, Clock, ShieldCheck } from "lucide-react";
import RefuseModal from "../RefuseModal";
import CheckerDrop from "../CheckerDrop";
import { useAuth } from "../../hooks/useAuth";
import useUpdatePostForApp from "../../hooks/useUpdatePostForApp";

interface Props {
  postForApp: any;
  index?: number;
  reFetch: () => void;
}

const statusConfig = {
  verified: {
    icon: <ShieldCheck className="w-4 h-4" />,
    color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700",
    bgHover: "hover:bg-green-100 dark:hover:bg-green-900/30"
  },
  checked: {
    icon: <Check className="w-4 h-4" />,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700",
    bgHover: "hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
  },
  refused: {
    icon: <X className="w-4 h-4" />,
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700",
    bgHover: "hover:bg-red-100 dark:hover:bg-red-900/30"
  },
  pending: {
    icon: <Clock className="w-4 h-4" />,
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700",
    bgHover: "hover:bg-amber-100 dark:hover:bg-amber-900/30"
  },
  null: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    bgHover: "hover:bg-gray-100 dark:hover:bg-gray-700"
  },
};

export default function PostForAppChecking({ postForApp, index = 0, reFetch }: Props) {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const { updatePostForApp } = useUpdatePostForApp();

  if (!postForApp) return <span className="text-xs text-gray-400 dark:text-gray-500">-</span>;

  const actual = postForApp;
  const [checking, setChecking] = useState<string | null>(actual?.checking || "null");
  const cfg = statusConfig[checking as keyof typeof statusConfig] || statusConfig.null;

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'checked': return 'checked';
      case 'refused': return 'refused';
      case 'waiting for checking': return 'waiting for checking';
      case 'null': return 'not ready';
      default: return status || 'not ready';
    }
  };

  return (
    <div className={`dropdown ${index === 0 ? "dropdown-end" : "dropdown-top dropdown-end"}`}>
      {/* Badge cliquable amélioré */}
      <label
        tabIndex={actual.id}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
          border transition-all duration-200 cursor-pointer select-none text-nowrap
          ${cfg.color} ${cfg.bgHover}
          shadow-sm hover:shadow-md
        `}
      >
        <span className="flex-shrink-0">{cfg.icon}</span>
        <span className="font-medium">{getStatusLabel(checking)}</span>
        <ChevronDown className="w-3 h-3 opacity-60 flex-shrink-0" />
      </label>

      {/* Modale refus */}
      {showModal && (
        <RefuseModal
          onClose={() => setShowModal(false)}
          onSubmit={async (comment: string) => {
            try {
              const res = await updatePostForApp(actual.id, { checking: "refused", comment });
              setChecking(res?.data?.checking ?? null);
              reFetch();
            } catch (err) {
              console.error('Erreur lors du refus:', err);
            }
            setShowModal(false);
          }}
        />
      )}

      {/* Menu déroulant */}
      <CheckerDrop
        isPost
        resource={actual}
        reFetch={reFetch}
        user={user}
        openRefuseModal={() => setShowModal(true)}
        updateFn={updatePostForApp}
        checking={checking}
        setChecking={setChecking}
      />
    </div>
  );
}