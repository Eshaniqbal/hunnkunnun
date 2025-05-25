
import AuthGuard from "@/components/AuthGuard";
import CreateListingForm from "@/components/listings/CreateListingForm";

export default function NewListingPage() {
  return (
    <AuthGuard>
      <CreateListingForm />
    </AuthGuard>
  );
}
