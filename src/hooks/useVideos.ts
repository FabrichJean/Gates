import useFetch from "http-react"
import { apiURL } from "../constant"

function UseVideos() {
    return useFetch(apiURL+"/videos")
}

export default UseVideos
