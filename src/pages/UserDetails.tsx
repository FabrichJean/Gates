import useUser from "../hooks/useUser";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import UpdatePassword from "../components/UpdatePassword";
import { deleteUserApi } from "../api/auth";
import toast from "react-hot-toast";
import { useState } from "react";

type UserLike = {
  id?: number | string;
  username?: string;
  email?: string;
  role?: string;
  isValidated?: boolean;
};

type Props = {
  user?: UserLike | null;
  userId?: string | number;
  compact?: boolean; // when true, render small avatar + name only
};

export default function UserDetails({ user: userProp, userId, compact = false }: Props) {
  const { user: me } = useAuth();
  const params = useParams();
  const routeId = (params as any)?.id;

  // prefer explicit prop -> route param -> userId prop
  const effectiveId = userProp ? undefined : (userId ?? routeId);
  const shouldFetch = !userProp && effectiveId !== undefined && effectiveId !== null;
  const fetched = shouldFetch ? useUser(effectiveId as any) : null;
  const user = userProp ?? (fetched ? (fetched as any).data : me);
  const loading = fetched ? (fetched as any).loading : false;
  const error = fetched ? (fetched as any).error : null;

  const avatarSeed = encodeURIComponent((user as any)?.username || "user");
  const [actionLoading, setActionLoading] = useState(false);
//   const reFetch = fetched ? (fetched as any).reFetch : undefined;

const nav = useNavigate()

  const handleBlock = async () => {
    if (!((user as any)?.id)) return;
    setActionLoading(true);
    try {
      await deleteUserApi((user as any).id);
      toast.success(`User ${(user as any).id} blocked`);
      nav('/archive');
    //   if (reFetch) reFetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Error');
    } finally {
      setActionLoading(false);
    }
  };
  if (loading) return <div className="flex items-center gap-2">Loading...</div>;
  if (error) return <div className="text-red-500">Erreur</div>;
  if (!user) return <div className="text-gray-500">No user</div>;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={`https://api.dicebear.com/9.x/croodles/svg?seed=${avatarSeed}`}
          alt={(user as any).username}
          className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-600"
        />
        <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{(user as any).username}</div>
      </div>
    );
  }

  return (
    <>
    <div className="flex items-center gap-6">
      <img
        src={`https://api.dicebear.com/9.x/croodles/svg?seed=${avatarSeed}`}
        alt={(user as any).username}
        className="w-20 h-20 rounded-full border border-gray-300 dark:border-gray-600 transition-all duration-300"
      />
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{(user as any).username}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{(user as any).email}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm">Type: {(user as any).role}</span>
          <span className={`px-2 py-1 rounded-md text-sm ${(user as any)?.isValidated ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
            {(user as any).isValidated ? 'Validated' : 'Pending validation'}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          {/* update password button - opens the modal rendered below */}
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <button className="btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded" onClick={() => document.getElementById('modal_' + (user as any).username)?.showModal()}>Update password</button>

          {/* block button (same as in Users list) */}
          { (user as any).role !== 'superadmin' && (
            <button onClick={handleBlock} disabled={actionLoading} className="btn bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded border border-red-200">{actionLoading ? 'Blocking...' : 'Block'}</button>
          )}
        </div>
      </div>
    </div>
    {/* Update password modal */}
    <UpdatePassword u={user as any} />
    </>
  );
}
