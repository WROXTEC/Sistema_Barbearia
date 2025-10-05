import React from 'react';

export function Logo() {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="mb-6">
        <img 
          src="/img-Photoroom.png" 
          alt="WRX Tecnologia" 
          className="w-32 h-32 object-contain"
        />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 text-center">WRX Tecnologia</h1>
      <p className="text-gray-600 text-center mt-2">Sistema de Gestão para Barbearias</p>
    </div>
  );
}