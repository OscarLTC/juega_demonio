import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { TiArrowLeft, TiArrowRight } from "react-icons/ti";

interface Prize {
  id: string;
  name: string;
  image: string;
}

interface Props {
  prizes: Prize[];
}

export const PrizeCarousel = ({ prizes }: Props) => {
  return (
    <div className="w-full relative px-4 sm:px-10">
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        loop={true}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
        className="w-full pb-12"
      >
        {prizes.map((prize) => (
          <SwiperSlide key={prize.id}>
            <div
              className={`relative border-2 border-intense-pink hover:border-white rounded-xl py-4 sm:py-6 h-64 sm:h-80 flex flex-col items-center justify-between bg-black hover:bg-white transition-colors group cursor-pointer`}
            >
              <div className="absolute opacity-0 group-hover:opacity-100 rounded-xl top-0 left-0 w-full h-full group-hover:bg-linear-to-b from-transparent from-10% via-transparent via-30% to-dark/50 to-90% z-20"></div>
              <div className="flex-1 flex items-center justify-center w-full">
                <img
                  src={prize.image}
                  alt={prize.name}
                  className="w-full h-auto max-h-32 sm:max-h-40 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              <h3 className="text-white text-2xl sm:text-3xl md:text-4xl font-family-nata uppercase -skew-x-6 mt-4 text-center px-2 z-20">
                {prize.name}
              </h3>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="flex items-center justify-center gap-8 mt-6">
        <button className="swiper-button-prev-custom text-intense-pink hover:scale-110 transition-transform cursor-pointer">
          <TiArrowLeft size={30} />
        </button>

        <button className="swiper-button-next-custom text-intense-pink hover:scale-110 transition-transform cursor-pointer">
          <TiArrowRight size={30} />
        </button>
      </div>
    </div>
  );
};
