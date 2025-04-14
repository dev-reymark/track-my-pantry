import React from "react";
import "@/styles/loader.css";
const Preloader = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="loader"></div>
    </div>
  );
};

export default Preloader;
