// Contexto para manejar datos del usuario logueado
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DatosUsuario {
  id: string;
  email: string;
  nombre: string;
  avatar: string;
  esPremium: boolean;
}

interface ContextoUsuarioType {
  usuario: DatosUsuario | null;
  setUsuario: (usuario: DatosUsuario | null) => void;
  estaLogueado: boolean;
}

const ContextoUsuario = createContext<ContextoUsuarioType | undefined>(undefined);

export function ProveedorUsuario({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<DatosUsuario | null>(null);

  return (
    <ContextoUsuario.Provider 
      value={{
        usuario,
        setUsuario,
        estaLogueado: !!usuario
      }}
    >
      {children}
    </ContextoUsuario.Provider>
  );
}

export function useUsuario() {
  const contexto = useContext(ContextoUsuario);
  if (!contexto) {
    throw new Error('useUsuario debe usarse dentro de ProveedorUsuario');
  }
  return contexto;
}