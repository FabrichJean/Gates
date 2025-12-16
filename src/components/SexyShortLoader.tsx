const SexyShortLoader = () => (
  <div className="relative w-20 h-20 mx-auto">
    {/* Cœur du loader : cercle pulsant */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 animate-pulse" />

    {/* Anneau tournant */}
    <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-white/80 animate-spin" />

    {/* Points orbitaux */}
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="absolute w-3 h-3 bg-white rounded-full shadow-lg"
        style={{
          top: '50%',
          left: '50%',
          transform: `rotate(${i * 120}deg) translateX(150%)`,
          animation: `orbit 1.5s linear infinite`,
          animationDelay: `${i * 0.2}s`,
        }}
      />
    ))}
  </div>
);

export default SexyShortLoader;