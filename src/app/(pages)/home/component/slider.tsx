import { useKeenSlider } from "keen-slider/react";

import "keen-slider/keen-slider.min.css";
import {
  Card,
  CardHeader,
  Image,
} from "@heroui/react";

export const Slider = () => {
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: {
      origin: "center",
      perView: 1.5,
      spacing: 16,
    },
    breakpoints: {
      "(min-width: 1024px)": {
        slides: {
          origin: "auto",
          perView: 1.5,
          spacing: 32,
        },
      },
    },
  });

  function handleNextSlide() {
    if (instanceRef.current) {
      instanceRef.current.next();
    }
  }

  function handlePreviousSlide() {
    if (instanceRef.current) {
      instanceRef.current.prev();
    }
  }
  return (
    <>
      <div className="relative overflow-hidden">
        <section className="">
          <div className="max-w-screen-2xl mx-auto py-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-center lg:gap-16">
              <div className="max-w-xl text-center ltr:sm:text-left rtl:sm:text-right">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Celebrity-Curated Recipe Packs, Right in Your Kitchen
                </h2>

                <p className="mt-4 text-gray-700">
                  Unlock exclusive dishes from culinary icons like Ninong Ry’s
                  high-protein meals or Judy Ann’s summer favorites. Stock your
                  pantry, cook like a pro, and generate smart grocery lists in
                  one click!
                </p>

                <div className="hidden lg:mt-8 lg:flex lg:gap-4">
                  <button
                    aria-label="Previous slide"
                    type="button"
                    onClick={handlePreviousSlide}
                    id="keen-slider-previous-desktop"
                    className="rounded-full border border-rose-600 p-3 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-5 rtl:rotate-180"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                      />
                    </svg>
                  </button>

                  <button
                    aria-label="Next slide"
                    type="button"
                    onClick={handleNextSlide}
                    id="keen-slider-next-desktop"
                    className="rounded-full border border-rose-600 p-3 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                  >
                    <svg
                      className="size-5 rtl:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 5l7 7-7 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="-mx-6 lg:col-span-2 lg:mx-0">
                <div id="keen-slider" className="keen-slider" ref={sliderRef}>
                  {/* Ninong Ry's High-Protein Meals */}
                  <div className="keen-slider__slide">
                    <Card className="col-span-12 sm:col-span-4">
                      <CardHeader className="absolute z-10 top-1 flex-col !items-start">
                        <p className="text-tiny text-white/60 uppercase font-bold">
                          High-Protein Picks
                        </p>
                        <h4 className="text-white font-medium text-large">
                          Ninong Ry’s Muscle Meals
                        </h4>
                      </CardHeader>
                      <Image
                        removeWrapper
                        alt="High-protein meal with grilled chicken"
                        className="z-0 w-full h-full object-cover"
                        src="https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg"
                      />
                    </Card>
                  </div>

                  {/* Healthy Filipino Recipes */}
                  <div className="keen-slider__slide">
                    <Card className="col-span-12 sm:col-span-4">
                      <CardHeader className="absolute z-10 top-1 flex-col !items-start">
                        <p className="text-tiny text-white/60 uppercase font-bold">
                          Filipino Flavors
                        </p>
                        <h4 className="text-white font-medium text-large">
                          Nutritious Filipino Dishes
                        </h4>
                      </CardHeader>
                      <Image
                        removeWrapper
                        alt="Healthy Filipino dish with vegetables"
                        className="z-0 w-full h-full object-cover"
                        src="https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg"
                      />
                    </Card>
                  </div>

                  {/* Filipino Street Food */}
                  <div className="keen-slider__slide">
                    <Card className="col-span-12 sm:col-span-4">
                      <CardHeader className="absolute z-10 top-1 flex-col !items-start">
                        <p className="text-tiny text-white/60 uppercase font-bold">
                          Street Eats
                        </p>
                        <h4 className="text-white font-medium text-large">
                          Filipino Street Food
                        </h4>
                      </CardHeader>
                      <Image
                        removeWrapper
                        alt="Plate of Filipino street food"
                        className="z-0 w-full h-full object-cover"
                        src="https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg"
                      />
                    </Card>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4 lg:hidden">
              <button
                aria-label="Previous slide"
                onClick={handlePreviousSlide}
                id="keen-slider-previous"
                className="rounded-full border border-rose-600 p-4 text-rose-600 transition hover:bg-rose-600 hover:text-white"
              >
                <svg
                  className="size-5 -rotate-180 transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              <button
                aria-label="Next slide"
                onClick={handleNextSlide}
                id="keen-slider-next"
                className="rounded-full border border-rose-600 p-4 text-rose-600 transition hover:bg-rose-600 hover:text-white"
              >
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
