"use client";
import Header from "./components/Header";
import Hero from "./components/Hero";

export default function Home() {
  const handleClickItem = (id: string) => console.log("Hiciste click en:", id);

  return (
    <div className="font-sans bg-gray-900 text-white">
      <Header />
      <Hero onClickItem={handleClickItem} />

      <section id="projects" className="p-12 text-center bg-gray-800">
        <h2 className="text-3xl font-bold mb-6">Proyectos Destacados</h2>
        <p className="text-lg max-w-xl mx-auto text-gray-300 mb-8">
          Aplicaciones web y móviles que demuestran mi expertise en desarrollo full-stack, con tecnologías como React, Node.js, TypeScript y más.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">E-commerce App</h3>
            <p className="text-gray-400">Next.js + Stripe + MongoDB</p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Dashboard Analytics</h3>
            <p className="text-gray-400">React + D3.js + Node.js</p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Mobile App</h3>
            <p className="text-gray-400">React Native + Firebase</p>
          </div>
        </div>
      </section>
    </div>
  );
}
