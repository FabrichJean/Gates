import type { ReactNode } from "react";
import { useAuth, useAuthMe } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

interface Props {
    children: ReactNode;
}

function SuperProtected({ children }: Props) {
    const {data: user, loading} = useAuthMe()

    return loading ? null : user?.role === "superadmin" ? children : <Navigate to="/" replace />
}

export default SuperProtected
