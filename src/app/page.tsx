"use client";

import { Button, Link } from "@heroui/react";
import { CiLocationArrow1 } from "react-icons/ci";

export default function Home() {
  return (
    <div className="relative flex items-center justify-center h-screen overflow-hidden before:absolute before:top-0 before:start-1/2 before:bg-[url('https://preline.co/assets/svg/examples/squared-bg-element.svg')] before:bg-no-repeat before:bg-top before:bg-cover before:opacity-40 before:w-full before:h-full before:-z-10 before:transform before:-translate-x-1/2">
      <div className="relative z-10 max-w-[85rem] w-full px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-xl mx-auto">
          <h1 className="block font-bold text-gray-800 text-4xl md:text-5xl lg:text-6xl">
            Discover <span className="text-blue-600">healthy recipes</span>{" "}
            right at home!
          </h1>
        </div>

        <div className="mt-5 max-w-3xl mx-auto">
          <p className="text-lg text-gray-700">
            Populate your pantry, browse our nutritious recipes, and create
            grocery lists for ingredients you don&apos;t have!
          </p>
        </div>

        <div className="mt-8 gap-3 flex justify-center">
          <Button
            startContent={<CiLocationArrow1 size={20} />}
            as={Link}
            variant="flat"
            href="/auth/login"
            className="mt-6"
            color="primary"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
