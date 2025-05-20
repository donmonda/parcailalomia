import { getProductoModel } from "@/lib/models/producto"
import { getClienteModel } from "@/lib/models/cliente"
import { getVentaModel } from "@/lib/models/venta"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"
import { Cliente } from "@/lib/models/cliente"
import { connectToAtlas } from './db'  // Cambiado de connectDB a connectToAtlas

// Función para obtener productos
export async function getProductos() {
  try {
    const ProductoModel = await getProductoModel()
    const productos = await ProductoModel.find({}).sort({ createdAt: -1 })
    return JSON.parse(JSON.stringify(productos))
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return []
  }
}

// Función para obtener clientes
export async function getClientes() {
  try {
    const ClienteModel = await getClienteModel()
    const clientes = await ClienteModel.find({}).sort({ nombre: 1 })
    return JSON.parse(JSON.stringify(clientes))
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    throw error
  }
}

// Función para obtener ventas
export async function getVentas() {
  try {
    const VentaModel = await getVentaModel()
    const ventas = await VentaModel.find({}).sort({ fecha: -1 }).populate("cliente").populate("items.producto")
    return JSON.parse(JSON.stringify(ventas))
  } catch (error) {
    console.error("Error al obtener ventas:", error)
    return []
  }
}

// Función para obtener datos del dashboard
export async function getDashboardData() {
  try {
    // Obtener modelos
    const VentaModel = await getVentaModel()
    const ProductoModel = await getProductoModel()
    const ClienteModel = await getClienteModel()

    // Fechas para comparar
    const now = new Date()
    const currentMonth = {
      start: startOfMonth(now),
      end: endOfMonth(now),
    }
    const lastMonth = {
      start: startOfMonth(subMonths(now, 1)),
      end: endOfMonth(subMonths(now, 1)),
    }

    // Ventas del mes actual
    const ventasCurrentMonth = await VentaModel.find({
      fecha: { $gte: currentMonth.start, $lte: currentMonth.end },
    })

    // Ventas del mes anterior
    const ventasLastMonth = await VentaModel.find({
      fecha: { $gte: lastMonth.start, $lte: lastMonth.end },
    })

    // Calcular totales
    const ventasTotales = ventasCurrentMonth.reduce((sum, venta) => sum + venta.total, 0)
    const ventasTotalesLastMonth = ventasLastMonth.reduce((sum, venta) => sum + venta.total, 0)

    // Calcular porcentajes de cambio
    const ventasPorcentaje =
      ventasTotalesLastMonth > 0 ? ((ventasTotales - ventasTotalesLastMonth) / ventasTotalesLastMonth) * 100 : 0

    // Contar clientes
    const totalClientes = await ClienteModel.countDocuments()
    const clientesLastMonth = await ClienteModel.countDocuments({
      createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
    })
    const clientesCurrentMonth = await ClienteModel.countDocuments({
      createdAt: { $gte: currentMonth.start, $lte: currentMonth.end },
    })
    const clientesPorcentaje =
      clientesLastMonth > 0 ? ((clientesCurrentMonth - clientesLastMonth) / clientesLastMonth) * 100 : 0

    // Contar productos
    const totalProductos = await ProductoModel.countDocuments()
    const productosLastMonth = await ProductoModel.countDocuments({
      createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
    })
    const productosCurrentMonth = await ProductoModel.countDocuments({
      createdAt: { $gte: currentMonth.start, $lte: currentMonth.end },
    })
    const productosPorcentaje =
      productosLastMonth > 0 ? ((productosCurrentMonth - productosLastMonth) / productosLastMonth) * 100 : 0

    // Contar devoluciones
    const totalDevoluciones = await VentaModel.countDocuments({
      estado: "devuelta",
      fecha: { $gte: currentMonth.start, $lte: currentMonth.end },
    })
    const devolucionesLastMonth = await VentaModel.countDocuments({
      estado: "devuelta",
      fecha: { $gte: lastMonth.start, $lte: lastMonth.end },
    })
    const devolucionesPorcentaje =
      devolucionesLastMonth > 0 ? ((totalDevoluciones - devolucionesLastMonth) / devolucionesLastMonth) * 100 : 0

    // Obtener ventas recientes
    const ventasRecientes = await VentaModel.find({}).sort({ fecha: -1 }).limit(5).populate("cliente")

    // Obtener productos con bajo stock
    const productosBajoStock = await ProductoModel.find({ stock: { $lt: 10 } })
      .sort({ stock: 1 })
      .limit(5)

    // Formatear datos para el dashboard
    return {
      ventasTotales,
      ventasPorcentaje,
      totalClientes,
      clientesPorcentaje,
      totalProductos,
      productosPorcentaje,
      totalDevoluciones,
      devolucionesPorcentaje,
      ventasRecientes: ventasRecientes.map((venta) => ({
        id: venta._id.toString(),
        numero: venta.numero,
        fecha: new Date(venta.fecha).toLocaleDateString(),
        cliente: venta.cliente.nombre,
        total: venta.total,
      })),
      productosBajoStock: productosBajoStock.map((producto) => ({
        id: producto._id.toString(),
        nombre: producto.nombre,
        sku: producto.sku,
        stock: producto.stock,
      })),
    }
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error)
    // Devolver datos por defecto en caso de error
    return {
      ventasTotales: 0,
      ventasPorcentaje: 0,
      totalClientes: 0,
      clientesPorcentaje: 0,
      totalProductos: 0,
      productosPorcentaje: 0,
      totalDevoluciones: 0,
      devolucionesPorcentaje: 0,
      ventasRecientes: [],
      productosBajoStock: [],
    }
  }
}
