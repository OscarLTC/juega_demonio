import type { Winner } from "../../types/winner";

interface WinnerCardProps {
  winner: Winner;
  priority?: boolean;
}

export const WinnerCard = ({ winner, priority }: WinnerCardProps) => {
  return (
    <div className="group relative flex flex-col items-center gap-4">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-intense-pink text-white text-lg font-black px-6 rounded-md z-20 uppercase shadow-lg font-family-display">
        Ganador
      </div>
      <div className="relative w-full aspect-3/4 bg-[#0a0a0a] rounded-3xl overflow-hidden border-4 border-intense-pink shadow-[0_0_30px_rgba(255,0,128,0.6),0_0_60px_rgba(255,0,128,0.3)] group-hover:shadow-[0_0_40px_rgba(255,0,128,0.5),0_0_80px_rgba(255,0,128,0.3)] transition-all duration-300">
        <div className="absolute inset-0 bg-linear-to-b from-gray-100 to-white">
          <img
            src={winner.image}
            alt={winner.prizeName}
            loading={priority ? "eager" : "lazy"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-90"></div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="bg-black/80 backdrop-blur-sm py-4 px-4 text-center ">
            <h3 className="text-white font-black text-2xl uppercase font-family-display">
              {winner.winnerName}
            </h3>
          </div>
          <div className=" bg-intense-pink py-2 text-center ">
            <span className="text-white font-bold text-lg uppercase font-family-display">
              Cod: {winner.code}
            </span>
          </div>
        </div>
      </div>

      <h4 className="text-pale-pink font-black text-xl text-center uppercase tracking-wide italic mt-2">
        {winner.prizeName}
      </h4>
    </div>
  );
};
