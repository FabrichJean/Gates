import { useParams } from "react-router-dom";



const RomanEdit = () => {
    const { id } = useParams<{ id: string }>();

    return <div>Roman Edit Page for ID: {id} </div>;
};

export default RomanEdit;