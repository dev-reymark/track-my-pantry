"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Input,
  Table,
  TableBody,
  TableColumn,
  TableHeader,
} from "@heroui/react";
import { SearchIcon } from "lucide-react";

export default function MyPantry() {
  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold">What&apos;s in your Pantry</h1>
          <p className="mt-2">Here is a list of items in your pantry</p>

          <Table
            className="mt-4"
            aria-label="Items in your pantry"
            topContent={
              <Input
                className=" w-full max-w-md"
                placeholder="Search"
                size="sm"
                startContent={<SearchIcon size={14} />}
                type="search"
              />
            }
          >
            <TableHeader>
              <TableColumn>ITEMS</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"No rows to display."}>{[]}</TableBody>
          </Table>
        </div>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
