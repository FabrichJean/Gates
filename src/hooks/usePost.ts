import { useState, useEffect } from "react";
import type { Category } from "../components/CategoryAutoComplete";
// import useFetch from "http-react";
// import { apiURL } from "../constant";
// import { getToken } from "../utils/storage";

export type PostStatus = "approved" | "pending" | "rejected";
export type PostChecking = "verified" | "pending" | "rejected";
export type postID = number | string | undefined;

export type TPost = {
    id: number;
    ref: string;
    username: string;
    category: Category;
    subCategory_id: Number;
    status: PostStatus;
    images: string[];
    videos: string[];
    duration: string;
    checking: PostChecking;
    createdAt: string;
    title :Array<{id : number, language : string, title : string, description : string}>;
};


// Données statiques pour la table (temporaire - sera remplacé par API)
export const staticPostData: TPost[] = [
    {
        id: 1,
        ref: "POST-001",
        username: "john_doe",
        category: {id : 1, name : "News", createdAt : new Date(), updatedAt : new Date()},
        subCategory_id: 1,
        status: "approved",
        images: ["/img static/3232.jpg"],
        videos: [
            "/video static/video.mp4",
            "/video static/video.mp4",
            "/video static/video.mp4",
            "/video static/video.mp4",
            "/video static/video.mp4"
        ],
        duration: "05:30",
        checking: "verified",
        createdAt: "2024-11-01",
        title: []
    },
    {
        id: 2,
        ref: "POST-002",
        username: "jane_smith",
        category: {id: 2, name: "Entertainment", createdAt : new Date(), updatedAt : new Date()},
        subCategory_id: 1,
        status: "pending",
        images: ["/img static/3232.jpg"],
        videos: [
            "/video static/video.mp4",
            "/video static/video.mp4",
            "/video static/video.mp4"
        ],
        duration: "12:45",
        checking: "pending",
        createdAt: "2024-11-02",
        title: [
            { id : 1, language: "en", title: "Behind the Scenes", description: "A deep dive into the creative process of filmmaking and music." },
            { id : 2, language: "fr", title: "Dans les coulisses", description: "Un aperçu exclusif du monde du cinéma et de la musique." },
            { id : 3, language: "mg", title: "Ao ambadiky ny sehatra", description: "Fijerena akaiky ny famoronana amin’ny sarimihetsika sy mozika." }
        ]
    },
    {
        id: 3,
        ref: "POST-003",
        username: "mike_wilson",
        category: {id: 3, name: "Technology", createdAt : new Date(), updatedAt : new Date()},
        subCategory_id: 1,
        status: "rejected",
        images: ["/img static/3232.jpg"],
        videos: [
            "/video static/video.mp4",
            "/video static/video.mp4",
            "/video static/video.mp4",
            "/video static/video.mp4",
            "/video static/video.mp4"
        ],
        duration: "08:15",
        checking: "rejected",
        createdAt: "2024-11-03",
        title: [
            { id : 1, language: "en", title: "AI in Everyday Life", description: "From smartphones to cars — how AI simplifies our world." },
            { id : 2, language: "fr", title: "L’IA au quotidien", description: "Comment l’intelligence artificielle facilite notre vie chaque jour." },
            { id : 3, language: "ar", title: "الذكاء الاصطناعي في الحياة اليومية", description: "كيف يجعل الذكاء الاصطناعي حياتنا أسهل في كل المجالات." }
        ]
    },
    {
        id: 4,
        ref: "POST-004",
        username: "sarah_jones",
        category: {id: 4, name: "Health", createdAt : new Date(), updatedAt : new Date()},
        subCategory_id: 1,
        status: "approved",
        images: ["/img static/3232.jpg"],
        videos: [
            "/video static/video.mp4",
            "/video static/video.mp4",
            "/video static/video.mp4",
            "/video static/video.mp4",
            "/video static/video.mp4"
        ],
        duration: "15:22",
        checking: "verified",
        createdAt: "2024-11-04",
        title: [
            { id : 1, language: "en", title: "Healthy Habits for Life", description: "Tips and strategies to build long-lasting physical and mental wellness." },
            { id : 2, language: "fr", title: "Les habitudes saines", description: "Des conseils pour entretenir un corps et un esprit en pleine forme." },
            { id : 3, language: "ar", title: "العادات الصحية للحياة", description: "نصائح للحفاظ على صحة الجسم والعقل مدى الحياة." },
            { id : 4, language: "es", title: "Hábitos saludables", description: "Consejos para una vida equilibrada y saludable." },
            { id : 5, language: "mg", title: "Fomba fiaina ara-pahasalamana", description: "Torohevitra ho an’ny fahasalamana ara-batana sy ara-tsaina maharitra." }
        ]
    },
    {
        id: 5,
        ref: "POST-005",
        username: "alex_brown",
        category: {id: 5, name: "Sports", createdAt : new Date(), updatedAt : new Date()},
        subCategory_id: 1,
        status: "pending",
        images: ["/img static/3232.jpg"],
        videos: [
            "/video static/video.mp4",
            "/video static/video.mp4",
            "/video static/video.mp4",
            "/video static/video.mp4",
            "/video static/video.mp4"
        ],
        duration: "09:38",
        checking: "pending",
        createdAt: "2024-11-05",
        title: [
            { id : 1, language: "en", title: "The Spirit of Competition", description: "Discover what drives athletes to push beyond their limits." },
            { id : 2, language: "fr", title: "L’esprit de compétition", description: "Plongée dans la motivation et la passion du sport." },
            { id : 3, language: "ar", title: "روح المنافسة", description: "ما الذي يدفع الرياضيين لتجاوز حدودهم؟" },
            { id : 4, language: "mg", title: "Fanahin’ny fifaninanana", description: "Ny antony manosika ny atleta hanao ezaka mihoatra." }
        ]
    },
    {
        id: 6,
        ref: "POST-006",
        username: "Dinosore",
        category: {id: 1, name: "News", createdAt : new Date(), updatedAt : new Date()},
        subCategory_id: 1,
        status: "pending",
        images: [
            "/img static/dinosore.jpeg",
            "/img static/dinosore2.jpeg",
            "/img static/dinosore3.jpeg",
            "/img static/dinosore4.jpeg"
        ],
        videos: [
            "/video static/video.mp4",
            "/video static/video.mp4",
            "/video static/video.mp4",
            "/video static/video.mp4",
            "/video static/video.mp4"
        ],
        duration: "09:38",
        checking: "pending",
        createdAt: "2024-11-05",
        title: [
            { id : 1, language: "en", title: "The Age of Dinosaurs", description: "Exploring the fascinating world of ancient reptiles that ruled Earth." },
            { id : 2, language: "fr", title: "L’ère des dinosaures", description: "Un voyage à travers le temps pour découvrir les géants de la préhistoire." },
            { id : 3, language: "ar", title: "عصر الديناصورات", description: "نظرة على الكائنات العملاقة التي سيطرت على الأرض قديماً." },
            { id : 4, language: "mg", title: "Andron’ny Dinosaures", description: "Fandalinana ny fiainan’ny biby goavam-be taloha." }
        ]
    }
];


// Hook pour récupérer un post par ID (actuellement statique, prêt pour API)
export function UsePost(id: postID) {
    const [data, setData] = useState<TPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!id) {
            setError(new Error("L'Id n'est pas trouver"));
            setLoading(false);
            return;
        }

        setLoading(true);
        
        // Simulation d'un appel API
        setTimeout(() => {
            const post = staticPostData.find(p => p.id === Number(id));
            setData(post || null);
            setLoading(false);
        }, 100);

        // TODO: Remplacer par un vrai appel API plus tard
        // return useFetch<TPost>(
        //     `${apiURL}/posts/${id}`,
        //     {
        //         headers: { Authorization: `Bearer ${getToken()}` }
        //     }
        // );

    }, [id]);

    return { data, loading, error };
}
// Hook pour récupérer tous les posts
export function UsePosts() {
    const [data, setData] = useState<TPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                
                // TODO: Remplacer par un vrai appel API
                // const response = await fetch(`${apiURL}/posts`, {
                //     headers: { 
                //         'Authorization': `Bearer ${getToken()}`,
                //         'Content-Type': 'application/json'
                //     }
                // });
                // const posts = await response.json();
                // setData(posts);
                
                // Simulation d'un appel API avec les données statiques
                setTimeout(() => {
                    setData(staticPostData);
                    setLoading(false);
                }, 100);
                
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return { data, loading, error };
}

// Fonction utilitaire pour obtenir le post précédent
export function getPrevPost(currentId: number, posts: TPost[]): TPost | undefined {
    return posts.find(p => p.id === currentId - 1);
}

// Fonction utilitaire pour obtenir le post suivant
export function getNextPost(currentId: number, posts: TPost[]): TPost | undefined {
    return posts.find(p => p.id === currentId + 1);
}

// Fonction utilitaire pour vérifier si un post précédent existe
export function hasPrevPost(currentId: number, posts: TPost[]): boolean {
    const prevPost = posts.find(p => p.id === currentId - 1);
    return prevPost !== undefined;
}

// Fonction utilitaire pour vérifier si un post suivant existe
export function hasNextPost(currentId: number, posts: TPost[]): boolean {
    const nextPost = posts.find(p => p.id === currentId + 1);
    return nextPost !== undefined;
}
