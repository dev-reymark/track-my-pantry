"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button, Card, CardBody, CardFooter, Image, Link } from "@heroui/react";

const cards = [
  {
    title: "Populate your Pantry",
    description: "Select ingredients you have available",
    href: "/additems",
    image: "https://images.pexels.com/photos/8289915/pexels-photo-8289915.jpeg",
  },
  {
    title: "Browse our recipes",
    description: "Choose from our wide selection of nutritious recipes",
    href: "/recipes",
    image:
      "https://images.pexels.com/photos/29666877/pexels-photo-29666877.jpeg",
  },
  {
    title: "Meal Prep for the week",
    description: "Plan your meals from recipes available.",
    href: "/mealplan",
    image: "https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg",
  },
  {
    title: "Generate Grocery lists",
    description: "For missing ingredients",
    href: "/grocerylist",
    image: "https://images.pexels.com/photos/5709271/pexels-photo-5709271.jpeg",
  },
];

export default function Home() {
  return (
    <ProtectedRoute>
      <ApplicationLayout title="Home | Track My Pantry">
        <div className="p-6">
          <div className="relative overflow-hidden">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="max-w-2xl text-center mx-auto mb-6">
                <h1 className="block text-3xl font-bold text-gray-800 sm:text-4xl md:text-5xl dark:text-white">
                  Discover healthy recipes right{" "}
                  <span className="text-blue-600">at home!</span>
                </h1>
                <p className="mt-3 text-lg text-gray-800 dark:text-neutral-400">
                  Populate your pantry, browse our nutritious recipes, and
                  create grocery lists for ingredients you don&apos;t have!
                </p>

                <Button as={Link} href="/mypantry" className="mt-6" color="primary">
                  What&apos;s in my Pantry?
                </Button>
              </div>

              <Image
                className="mb-6"
                src="https://images.pexels.com/photos/1640771/pexels-photo-1640771.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt=""
              />

              <div className="max-w-2xl text-center mx-auto py-6">
                <h1 className="block text-3xl font-bold text-gray-800">
                  What’s new
                </h1>
                <p className="mt-3 text-lg text-gray-800 dark:text-neutral-400">
                  Check out our latest and hotest feature updates, success
                  stories, and marketing tips.
                </p>
                <div className="border-t border-gray-200 my-6"></div>
              </div>

              <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
                {cards.map((card, index) => (
                  <Card
                    key={index}
                    isPressable
                    as={Link}
                    shadow="sm"
                    href={card.href}
                  >
                    <CardBody className="overflow-visible p-0">
                      <Image
                        src={card.image}
                        className=" w-[500px] h-[300px] object-cover"
                        alt={card.title}
                      />
                    </CardBody>
                    <CardFooter className="flex flex-col gap-2">
                      <b>{card.title}</b>
                      <p className="text-default-500">{card.description}</p>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
