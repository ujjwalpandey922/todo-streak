import LandingPage from "@/components/Landing Page";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-2 bg-zinc-950 text-white bg-[url('/bg.jpg')] bg-cover backdrop-blur-sm">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <LandingPage />
    </main>
  );
}
