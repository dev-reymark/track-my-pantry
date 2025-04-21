"use client";

import { Button, Link } from "@heroui/react";
import { useEffect, useState } from "react";
import {
  Settings,
  MoreHorizontal,
  ShoppingBasket,
  PlusCircle,
  BookOpen,
  CalendarDays,
  Home,
  List,
} from "lucide-react";
import { CgClose } from "react-icons/cg";
import { ApplicationLogo } from "../ApplicationLogo";
import LogOut from "../auth/LogOut";
import { usePathname } from "next/navigation";
import { BiBasket } from "react-icons/bi";
import { useAuth } from "@/context/AuthContext";

interface ApplicationLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function ApplicationLayout({
  children,
  title,
}: ApplicationLayoutProps) {
  const { user } = useAuth();
  // console.log('user', user);
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openedFromMore, setOpenedFromMore] = useState(false);

  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  const toggleSidebar = (fromMore: boolean = false) => {
    setSidebarOpen((prev) => !prev);
    setOpenedFromMore(fromMore);
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Overlay for sidebar */}
      <Button
        variant="flat"
        isIconOnly
        className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-40 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onPress={() => toggleSidebar(false)}
      ></Button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-50 bg-gray-50 text-white w-64 h-full p-4 transition-transform transform overflow-y-auto flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:block`}
      >
        <div className="flex items-center justify-between mb-2">
          <ApplicationLogo />
          <Button
            variant="light"
            isIconOnly
            className="text-white lg:hidden"
            onPress={() => toggleSidebar(false)}
          >
            <CgClose size={20} className="text-danger" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* <ul className="space-y-2">
            <li>
              <Link
                href="/home"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/home")
                    ? "bg-gray-200 text-black font-semibold"
                    : "text-gray-800"
                }`}
              >
                <Home size={18} />
                Home
              </Link>
              {user?.role === "admin" ? (
                <Link
                  href="/pantry"
                  className={`flex items-center gap-2 p-2 rounded ${
                    isActive("/pantry")
                      ? "bg-gray-200 text-black font-semibold"
                      : "text-gray-800"
                  }`}
                >
                  <BiBasket size={18} />
                  Pantry
                </Link>
              ) : null}
              {!openedFromMore && (
                <>
                  <Link
                    href="/mypantry"
                    className={`flex items-center gap-2 p-2 rounded ${
                      isActive("/mypantry")
                        ? "bg-gray-200 text-black font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    <ShoppingBasket size={18} />
                    My Pantry
                  </Link>

                  <Link
                    href="/additems"
                    className={`flex items-center gap-2 p-2 rounded ${
                      isActive("/additems")
                        ? "bg-gray-200 text-black font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    <PlusCircle size={18} />
                    Add Items
                  </Link>

                  <Link
                    href="/recipes"
                    className={`flex items-center gap-2 p-2 rounded ${
                      isActive("/recipes")
                        ? "bg-gray-200 text-black font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    <BookOpen size={18} />
                    Recipes
                  </Link>

                  <Link
                    href="/mealplan"
                    className={`flex items-center gap-2 p-2 rounded ${
                      isActive("/mealplan")
                        ? "bg-gray-200 text-black font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    <CalendarDays size={18} />
                    Meal Plan
                  </Link>
                </>
              )}

              <Link
                href="/grocerylist"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/grocerylist")
                    ? "bg-gray-200 text-black font-semibold"
                    : "text-gray-800"
                }`}
              >
                <List size={18} />
                Grocery Items
              </Link>

              <Link
                href="/accountsetting"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/accountsetting")
                    ? "bg-gray-200 text-black font-semibold"
                    : "text-gray-800"
                }`}
              >
                <Settings size={18} />
                Account Settings
              </Link>
            </li>
          </ul> */}

          <ul className="space-y-2">
            <li>
              <Link
                href="/home"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/home")
                    ? "bg-gray-200 text-black font-semibold"
                    : "text-gray-800"
                }`}
              >
                <Home size={18} />
                Home
              </Link>

              {user?.role === "admin" ? (
                <>
                  <Link
                    href="/pantry"
                    className={`flex items-center gap-2 p-2 rounded ${
                      isActive("/pantry")
                        ? "bg-gray-200 text-black font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    <BiBasket size={18} />
                    Pantry
                  </Link>
                  <Link
                    href="/recipes"
                    className={`flex items-center gap-2 p-2 rounded ${
                      isActive("/recipes")
                        ? "bg-gray-200 text-black font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    <BookOpen size={18} />
                    Recipes
                  </Link>
                </>
              ) : (
                !openedFromMore && (
                  <>
                    <Link
                      href="/mypantry"
                      className={`flex items-center gap-2 p-2 rounded ${
                        isActive("/mypantry")
                          ? "bg-gray-200 text-black font-semibold"
                          : "text-gray-800"
                      }`}
                    >
                      <ShoppingBasket size={18} />
                      My Pantry
                    </Link>

                    <Link
                      href="/additems"
                      className={`flex items-center gap-2 p-2 rounded ${
                        isActive("/additems")
                          ? "bg-gray-200 text-black font-semibold"
                          : "text-gray-800"
                      }`}
                    >
                      <PlusCircle size={18} />
                      Add Items
                    </Link>

                    <Link
                      href="/recipes"
                      className={`flex items-center gap-2 p-2 rounded ${
                        isActive("/recipes")
                          ? "bg-gray-200 text-black font-semibold"
                          : "text-gray-800"
                      }`}
                    >
                      <BookOpen size={18} />
                      Recipes
                    </Link>

                    <Link
                      href="/mealplan"
                      className={`flex items-center gap-2 p-2 rounded ${
                        isActive("/mealplan")
                          ? "bg-gray-200 text-black font-semibold"
                          : "text-gray-800"
                      }`}
                    >
                      <CalendarDays size={18} />
                      Meal Plan
                    </Link>
                  </>
                )
              )}

              {!user?.role || user?.role !== "admin" ? (
                <Link
                  href="/grocerylist"
                  className={`flex items-center gap-2 p-2 rounded ${
                    isActive("/grocerylist")
                      ? "bg-gray-200 text-black font-semibold"
                      : "text-gray-800"
                  }`}
                >
                  <List size={18} />
                  Grocery Items
                </Link>
              ) : null}

              <Link
                href="/accountsetting"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/accountsetting")
                    ? "bg-gray-200 text-black font-semibold"
                    : "text-gray-800"
                }`}
              >
                <Settings size={18} />
                Account Settings
              </Link>
            </li>
          </ul>
        </div>
        <div className="pt-4 border-t border-gray-200">
          <LogOut />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full lg:ps-64 p-4 pb-16 lg:pb-4">{children}</div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-md lg:hidden">
        <ul className="flex justify-around text-gray-700">
          <li className="flex flex-col items-center p-2">
            <Link
              href="/mypantry"
              className={`flex flex-col items-center text-xs ${
                isActive("/mypantry")
                  ? "text-blue-600 font-semibold"
                  : "text-gray-700"
              }`}
            >
              <ShoppingBasket size={20} />
              My Pantry
            </Link>
          </li>
          <li className="flex flex-col items-center p-2">
            <Link
              href="/additems"
              className={`flex flex-col items-center text-xs ${
                isActive("/additems")
                  ? "text-blue-600 font-semibold"
                  : "text-gray-700"
              }`}
            >
              <PlusCircle size={20} />
              Add Items
            </Link>
          </li>
          <li className="flex flex-col items-center p-2">
            <Link
              href="/recipes"
              className={`flex flex-col items-center text-xs ${
                isActive("/recipes")
                  ? "text-blue-600 font-semibold"
                  : "text-gray-700"
              }`}
            >
              <BookOpen size={20} />
              Recipes
            </Link>
          </li>
          <li className="flex flex-col items-center p-2">
            <Link
              href="/mealplan"
              className={`flex flex-col items-center text-xs ${
                isActive("/mealplan")
                  ? "text-blue-600 font-semibold"
                  : "text-gray-700"
              }`}
            >
              <CalendarDays size={20} />
              Meal Plan
            </Link>
          </li>
          <li className="flex flex-col items-center p-2">
            <button
              onClick={() => toggleSidebar(true)}
              className="flex flex-col items-center text-xs"
            >
              <MoreHorizontal size={20} />
              More
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
