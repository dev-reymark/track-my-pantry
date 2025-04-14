"use client";

import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableColumn,
  TableHeader,
  useDisclosure,
} from "@heroui/react";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function MealPlan() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="p-6">
          <Table
            className="mt-4"
            aria-label="Items in your pantry"
            topContent={
              <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Weekly Meal Plan</h1>

                <Button color="primary" onPress={onOpen}>
                  Add Meals
                </Button>
              </div>
            }
          >
            <TableHeader>
              <TableColumn>Food</TableColumn>
              <TableColumn>Day</TableColumn>
              <TableColumn>Calorie</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"No rows to display."}>{[]}</TableBody>
          </Table>
        </div>

        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Add Meals</ModalHeader>
                <ModalBody>
                  <Select isRequired label="Select">
                    {days.map((day) => (
                      <SelectItem key={day}>{day}</SelectItem>
                    ))}
                  </Select>

                  <Input label="Food" isRequired type="text" />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="primary" onPress={onClose}>
                    Add
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
