import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { BarChart3, Users, Package, ShoppingCart } from "lucide-react"
import { getDashboardData } from "@/lib/data-utils"

export default async function Home() {
  const dashboardData = await getDashboardData()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/ventas/nueva">Nueva Venta</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.ventasTotales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.ventasPorcentaje > 0 ? "+" : ""}
              {dashboardData.ventasPorcentaje.toFixed(1)}% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{dashboardData.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.clientesPorcentaje > 0 ? "+" : ""}
              {dashboardData.clientesPorcentaje.toFixed(1)}% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalProductos}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.productosPorcentaje > 0 ? "+" : ""}
              {dashboardData.productosPorcentaje.toFixed(1)}% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Devoluciones</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalDevoluciones}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.devolucionesPorcentaje > 0 ? "+" : ""}
              {dashboardData.devolucionesPorcentaje.toFixed(1)}% desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
            <CardDescription>Últimas 5 ventas realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.ventasRecientes.map((venta) => (
                <div key={venta.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Factura #{venta.numero}</p>
                    <p className="text-sm text-muted-foreground">Cliente: {venta.cliente}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${venta.total.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{venta.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Productos con Bajo Stock</CardTitle>
            <CardDescription>Productos que necesitan reabastecimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.productosBajoStock.map((producto) => (
                <div key={producto.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{producto.nombre}</p>
                    <p className="text-sm text-muted-foreground">SKU: {producto.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-500">{producto.stock} unidades</p>
                    <p className="text-sm text-muted-foreground">Stock mínimo: 10</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
