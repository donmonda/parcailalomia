// Definición de tipos para la aplicación

export interface Producto {
  id: string
  nombre: string
  sku: string
  precio: number
  stock: number
  categoria: string
  descripcion?: string
  imagenUrl?: string
  videoUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Cliente {
  id: string
  nombre: string
  email: string
  telefono: string
  direccion: string
  rfc: string
  createdAt: string
  updatedAt: string
}

export interface ItemVenta {
  id: string
  producto: Producto
  cantidad: number
  precio: number
  subtotal: number
}

export interface Venta {
  id: string
  numero: string
  fecha: string
  cliente: Cliente
  items: ItemVenta[]
  subtotal: number
  iva: number
  total: number
  estado: "completada" | "devuelta"
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
}
