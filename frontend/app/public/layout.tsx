// app/(public)/layout.tsx
import Header from "@/components/Header";
// import Footer from "@/components/Footer"; // when ready

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pt-20">{children}</main>
      {/* <Footer /> */}
    </>
  );
}
