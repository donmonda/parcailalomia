// Modelo de venta para MongoDB Atlas

import mongoose from "mongoose"
import { connectToAtlas } from "../db"

// Definición del esquema de item de venta
const itemVentaSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto",
    required: true,
  },
  cantidad: {
    type: Number,
    required: true,
  },
  precio: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
})

// Definición del esquema de venta
const ventaSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: true,
      unique: true,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
    },
    items: [itemVentaSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    iva: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    estado: {
      type: String,
      enum: ["completada", "devuelta"],
      default: "completada",
    },
  },
  {
    timestamps: true,
  },
)

// Exportar modelo
export async function getVentaModel() {
  const conn = await connectToAtlas()
  return conn.model("Venta", ventaSchema)
}
