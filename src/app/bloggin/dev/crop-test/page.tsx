import { notFound } from "next/navigation";
import CropTestView from "./crop-test-view";

// Dev-only page: the header-image drop zone and cropper, with the result
// reported instead of uploaded, for the Playwright tests.
export default function CropTestPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <CropTestView />;
}
