import { NextResponse } from "next/server"
import { getClienteModel } from "@/lib/models/cliente"

// GET - Obtener un cliente por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const ClienteModel = await getClienteModel()
    const cliente = await ClienteModel.findById(id)

    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error("Error al obtener cliente:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// PUT - Actualizar un cliente
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()

    // Validar datos de entrada
    if (!data.nombre || !data.email || !data.telefono || !data.direccion || !data.rfc) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const ClienteModel = await getClienteModel()

    // Verificar si el cliente existe
    const clienteExistente = await ClienteModel.findById(id)

    if (!clienteExistente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    // Verificar si el email o RFC ya está en uso por otro cliente
    const duplicado = await ClienteModel.findOne({
      $or: [{ email: data.email }, { rfc: data.rfc }],
      _id: { $ne: id },
    })

    if (duplicado) {
      return NextResponse.json({ error: "Ya existe otro cliente con ese email o RFC" }, { status: 409 })
    }

    // Actualizar el cliente
    const clienteActualizado = await ClienteModel.findByIdAndUpdate(
      id,
      {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion,
        rfc: data.rfc,
      },
      { new: true },
    )

    return NextResponse.json(clienteActualizado)
  } catch (error) {
    console.error("Error al actualizar cliente:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// DELETE - Eliminar un cliente
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const ClienteModel = await getClienteModel()
    const VentaModel = await (await import("@/lib/models/venta")).getVentaModel()

    // Verificar si el cliente existe
    const cliente = await ClienteModel.findById(id)

    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    // Verificar si el cliente tiene ventas asociadas
    const ventasAsociadas = await VentaModel.countDocuments({ cliente: id })

    if (ventasAsociadas > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar el cliente porque tiene ventas asociadas" },
        { status: 400 },
      )
    }

    // Eliminar el cliente
    await ClienteModel.findByIdAndDelete(id)

    return NextResponse.json({ message: "Cliente eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar cliente:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
