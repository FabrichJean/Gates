import VideoCard from "./VideoCard";

// eslint-disable-next-line react-refresh/only-export-components
export const videos = [
  {
    id: 1,
    title: "Madagascar humilie la France et l’ex-Président : l’Armée bloque le Graphite !",
    channel: "AfroStrategie",
    views: "16 k vues",
    time: "il y a 13 heures",
    thumbnail: "https://picsum.photos/200/300",
    duration: "14:14",
  },
  {
    id: 2,
    title: "Le colonel Randrianirina investi président de Madagascar",
    channel: "FRANCE 24",
    views: "84 k vues",
    time: "il y a 16 heures",
    thumbnail: "https://picsum.photos/200/300",
    duration: "11:31",
  },
  {
    id: 3,
    title: "Music for Work — Deep Focus Mix pour la programmation et le codage",
    channel: "Chill Flow",
    views: "919 k vues",
    time: "il y a 10 mois",
    thumbnail: "https://picsum.photos/200/300",
    duration: "3:21:19",
  },
];


const VideoListCard = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
};

export default VideoListCard;
