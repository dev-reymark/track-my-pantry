"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Table, TableBody, TableColumn, TableHeader } from "@heroui/react";

export default function GroceryList() {
  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold">Grocery List</h1>
          <p>Missing items to buy based on your One week Meal Plan.</p>

          <Table className="mt-4" aria-label="Items">
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
