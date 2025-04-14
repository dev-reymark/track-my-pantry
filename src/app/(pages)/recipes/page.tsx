"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Input } from "@heroui/react";
import { SearchIcon } from "lucide-react";

export default function Recipes() {
  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold">Browse our Recipes</h1>
          <p>Filter by time, mains, and our special filters.</p>

          <Input
            className=" w-full max-w-md my-4"
            placeholder="Search"
            size="sm"
            startContent={<SearchIcon size={14} />}
            type="search"
          />
        </div>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
