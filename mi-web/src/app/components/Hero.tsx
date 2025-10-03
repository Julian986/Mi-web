"use client";

import { Scene3D } from "./Hero3D";

type HeroProps = {
  onClickItem?: (id: string) => void;
};

export default function Hero({ onClickItem = () => {} }: HeroProps) {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-60">
        <div className="w-full h-full bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%239C92AC fill-opacity=0.05%3E%3Ccircle cx=30 cy=30 r=1/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="flex items-center min-h-screen">
          {/* Left side - Content */}
          <div className="flex-1 lg:max-w-2xl">
            <div className="space-y-8">
              {/* Tag */}
              <div className="inline-flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Available for freelance work</span>
              </div>

              {/* Main heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Julián Sánchez{" "}
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Desarrollador
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl">
                Desarrollador full-stack especializado en React, Node.js y tecnologías modernas. 
                Creo aplicaciones web extraordinarias que impulsan el éxito de tu negocio con código limpio y arquitectura escalable.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  <span>Ver Proyectos</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="inline-flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span>Ver Portfolio</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right side - 3D Scene */}
          <div className="hidden lg:block flex-1 lg:max-w-lg xl:max-w-xl">
            <div className="relative h-[500px] lg:h-[600px]">
              <Scene3D onClickItem={onClickItem} />
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-8 left-4 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>

      {/* Floating elements for visual interest */}
      <div className="absolute top-1/4 left-10 opacity-30">
        <div className="w-20 h-20 border border-gray-700 rounded-lg rotate-12"></div>
      </div>
      <div className="absolute bottom-1/4 right-10 opacity-30">
        <div className="w-16 h-16 border border-gray-700 rounded-full"></div>
      </div>
    </section>
  );
}
