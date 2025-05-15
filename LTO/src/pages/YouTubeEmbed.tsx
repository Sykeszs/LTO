const YouTubeEmbed = ({ videoId }: { videoId: string }) => {
    return (
      <div className="w-full aspect-w-16 aspect-h-9">
        <div className="mb-4">
          <h2 className="text-xl text-white">HOW TO GET LTO <span className="font-bold">DRIVER'S LICENSE</span></h2>
        </div>
        <iframe
          className="w-full h-80 rounded shadow-lg"
          src={`https://www.youtube.com/embed/l0uB5X6xvHA?si=otRQXwxzEtFdbzmg`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <div className="mt-4">
          <p className="text-2xl font-semibold text-white">LTO NAIC ONLINE APPOINTMENT</p>
          <p className="text-xl text-white">APPLY NOW!</p>
        </div>
      </div>
    );
  };
  
  export default YouTubeEmbed;
  