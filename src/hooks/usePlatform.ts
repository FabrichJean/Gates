import useFetch from "http-react"
import { apiURL } from "../constant"
import { getToken } from "../utils/storage"
import { useEffect, useState } from "react";
import axios from "axios";

const getAllPlatformUrl = apiURL + "/plateform";
export type Platform = {
   id: number;
   name: string;
   category : any[]
}

export const usePlatform = () => {
   return useFetch<{ Platforms: Platform[] }>(getAllPlatformUrl, {
      headers: { Authorization: `Bearer ${getToken()}` },
   })
}

export const usePlatformReactive = () => {
   const [platforms, setPlatforms] = useState<Platform[]>([]);
   
   const fetchPlatforms = async () => {
      try {
         const res = await axios.get<Platform[]>(getAllPlatformUrl, {
            headers: { Authorization: `Bearer ${getToken()}` },
         });

         if(res){
             setPlatforms(res.data);         
         }else{
            throw new Error("Erreur lors du chargement des plateformes");
         }

      } catch (error) {
         console.error("Erreur lors du chargement des plateformes :", error);
      }
   };

   useEffect(() => {
      fetchPlatforms();
   }, []);

   return { data: platforms, reFetch: fetchPlatforms };
}
   