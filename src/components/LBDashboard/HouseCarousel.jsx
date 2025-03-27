// src/components/HouseCarousel.tsx
import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

// customer can check different image
import houseImg1 from "./houseImg.png";
import houseImg2 from "./houseImg.png";
import houseImg3 from "./houseImg.png";


const HouseCarousel = () => {
  return (
    <Carousel showArrows={true} dynamicHeight={true} showThumbs={false}>
      <div>
        <img src={houseImg1} alt="Eco Village House 1" />
      </div>
      <div>
        <img src={houseImg2} alt="Eco Village House 2" />
      </div>
      <div>
        <img src={houseImg3} alt="Eco Village House 3" />
      </div>
    </Carousel>
  );
};

export default HouseCarousel;
