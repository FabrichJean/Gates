import { useParams } from "react-router-dom";



const RomanDetails = () => {
    const { id } = useParams<{ id: string }>();

    return <div>Roman Details Page for ID: {id} </div>;
};

export default RomanDetails;