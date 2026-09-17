"use client";

import { createContext, useContext, useState } from "react";

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);

  const agregarAlCarrito = (producto) => {
    setCarrito((prevCarrito) => {
      const existe = prevCarrito.find(
        (item) => item.id === producto.id
      );

      if (existe) {
        return prevCarrito.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [
        ...prevCarrito,
        {
          ...producto,
          cantidad: 1,
        },
      ];
    });
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const totalItems = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  const totalCarrito = carrito.reduce(
    (total, item) =>
      total + item.precio * item.cantidad,
    0
  );

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        eliminarDelCarrito,
        vaciarCarrito,
        modalAbierto,
        setModalAbierto,
        totalItems,
        totalCarrito,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  return useContext(CarritoContext);
}