import mongoose from "mongoose"
import { connectToAtlas } from "../db"

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true },
  telefono: String,
  direccion: String,
  rfc: { type: String, required: true }
}, {
  timestamps: true
})

export async function getClienteModel() {
  const conn = await connectToAtlas()
  return conn.model("Cliente", clienteSchema)
}

export const Cliente = mongoose.models.Cliente || mongoose.model("Cliente", clienteSchema)
