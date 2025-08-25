import { redirect } from "next/navigation"

export default function HomePage() {
  // Permanently redirect root to /docs
  redirect("/docs")
}
