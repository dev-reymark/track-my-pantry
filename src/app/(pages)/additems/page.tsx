import ApplicationLayout from "@/components/layout/ApplicationLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AddItems() {
  return (
    <ProtectedRoute>
      <ApplicationLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold">Add Items</h1>
        </div>
      </ApplicationLayout>
    </ProtectedRoute>
  );
}
