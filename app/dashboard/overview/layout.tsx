// app/dashboard/written-questions/layout.tsx
import ClientLayout from "./client-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
