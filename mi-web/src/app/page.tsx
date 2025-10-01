"use client";
import Hero3D from "./components/Hero3D";

export default function Home() {
  const handleClickItem = (id: string) => console.log("Hiciste click en:", id);

  return (
    <div className="font-sans min-h-screen bg-gray-900 text-white">
      <Hero3D onClickItem={handleClickItem} />

      <section className="p-12 text-center">
        <h2 className="text-3xl font-bold mb-6">Mis proyectos destacados</h2>
        <p className="text-lg max-w-xl mx-auto">
          Acá mostraré mis proyectos de diseño y desarrollo, interactivos y funcionales.
        </p>
      </section>
    </div>
  );
}
