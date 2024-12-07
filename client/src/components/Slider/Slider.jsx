import React, { useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';



// import required modules
import { Pagination } from 'swiper/modules';
const Slider = () => {
  return (
    <div className='mx-2 mt-20'>
    <Swiper
      pagination={{
        dynamicBullets: true,
      }}
      modules={[Pagination]}
      className="mySwiper"
    >
      <SwiperSlide><img  className='w-full  rounded-xl  ' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo7-vzQFCfUsyC6Am2-jrY84TtK5SYg8imMw&s" alt="" /></SwiperSlide>
      <SwiperSlide><img className='w-full rounded-xl  '  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo7-vzQFCfUsyC6Am2-jrY84TtK5SYg8imMw&s" alt="" /></SwiperSlide>
      <SwiperSlide><img className='w-full  rounded-xl '  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo7-vzQFCfUsyC6Am2-jrY84TtK5SYg8imMw&s" alt="" /></SwiperSlide>
    </Swiper>
  </div>
  )
}

export default Slider