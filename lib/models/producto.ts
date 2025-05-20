// Modelo de producto para MongoDB Atlas

import mongoose from "mongoose"
import { connectToAtlas } from "../db"

// Definición del esquema de producto
const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    precio: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    categoria: {
      type: String,
      required: true,
    },
    descripcion: {
      type: String,
      default: "",
    },
    imagenUrl: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

// Exportar modelo
export async function getProductoModel() {
  const conn = await connectToAtlas()
  return conn.model("Producto", productoSchema)
}
