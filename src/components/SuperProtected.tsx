import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { apiURL, token } from "../constant";
import { RotateLoader } from "react-spinners";

interface Props {
    children: ReactNode;
}

function SuperProtected({ children }: Props) {
    const [ok, setOk] = useState<boolean | null>(null)

    useEffect(() => {
        (async () => {
            await axios.get<{role: string}>(apiURL + '/auth', {
                headers: { Authorization: `Bearer ${token()}` },
            })
            .then((res) => {
                setOk(Boolean(res.data.role === "superadmin"))
                console.log(res.data);
                
            })
            .catch(() => {
                setOk(false)
            })
        })() 
    }, [])

    return (ok !== null) ? ok === true  ? children : <Navigate to="/" replace /> : <div className="w-full h-screen flex items-center justify-center"><RotateLoader color="#00d3f2" className="w-14 h-auto" /></div>
}

export default SuperProtected
