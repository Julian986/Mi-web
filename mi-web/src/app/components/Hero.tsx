"use client";

import { Scene3D } from "./Hero3D";

type HeroProps = {
  onClickItem?: (id: string) => void;
};

export default function Hero({ onClickItem = () => {} }: HeroProps) {
  return (
    <section className="relative min-h-screen bg-transparent overflow-hidden">
      
      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-screen py-20">
          {/* Left side - Content */}
          <div className="flex-1 max-w-2xl">
            <div className="space-y-8">
              {/* Tag */}
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-700 font-medium">Available for freelance work</span>
              </div>

              {/* Main heading */}
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Julián Sánchez{" "}
                <span className="bg-gradient-to-r from-[#0070f3] to-[#7928CA] bg-clip-text text-transparent">
                  Desarrollador
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                Desarrollador full-stack especializado en React, Node.js y tecnologías modernas. 
                Creo aplicaciones web extraordinarias que impulsan el éxito de tu negocio.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-[#0070f3] to-[#7928CA] hover:from-[#0ea5e9] hover:to-[#8b5cf6] text-white px-8 py-4 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl">
                  <span>Ver Proyectos</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="inline-flex items-center justify-center space-x-2 bg-transparent hover:bg-white/5 text-gray-200 px-8 py-4 rounded-lg font-medium transition-colors border border-white/20 shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span>Ver Portfolio</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Visual Element (3D) */}
          <div className="hidden lg:block flex-1 max-w-lg ml-12">
            <div className="relative w-full h-[500px]">
              <Scene3D />
            </div>
          </div>
        </div>

        {/* Mobile visual (3D) */}
        <div className="lg:hidden flex justify-center items-center mt-12">
          <div className="relative w-80 h-80">
            <Scene3D />
          </div>
        </div>
      </div>
    </section>
  );
}
