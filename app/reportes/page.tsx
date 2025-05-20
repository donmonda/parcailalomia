"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { FileSpreadsheet, FileIcon as FilePdf, BarChart3, LineChart, PieChart } from "lucide-react"
import { DatePickerWithRange } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { addDays } from "date-fns"

export default function ReportesPage() {
  const { toast } = useToast()
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  const handleGenerarExcel = () => {
    // En una implementación real, aquí se generaría el reporte en Excel
    toast({
      title: "Reporte generado",
      description: "El reporte en Excel ha sido generado exitosamente.",
    })
  }

  const handleGenerarPDF = () => {
    // En una implementación real, aquí se generaría el reporte en PDF
    toast({
      title: "Reporte generado",
      description: "El reporte en PDF ha sido generado exitosamente.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reportes</h1>
      </div>

      <div className="flex items-center space-x-4">
        <DatePickerWithRange date={date} setDate={setDate} />
      </div>

      <Tabs defaultValue="ventas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="ventas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$15,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% desde el período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Número de Ventas</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48</div>
                <p className="text-xs text-muted-foreground">+12.2% desde el período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$317.33</div>
                <p className="text-xs text-muted-foreground">+5.3% desde el período anterior</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reporte de Ventas</CardTitle>
              <CardDescription>Genere reportes detallados de ventas en el período seleccionado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-medium">Información incluida en el reporte:</h3>
                <ul className="list-disc list-inside text-sm">
                  <li>Listado de ventas con detalles</li>
                  <li>Total de ventas por cliente</li>
                  <li>Total de ventas por producto</li>
                  <li>Análisis de ventas diarias</li>
                  <li>Comparativa con período anterior</li>
                </ul>
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleGenerarExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Generar Excel
                </Button>
                <Button onClick={handleGenerarPDF}>
                  <FilePdf className="mr-2 h-4 w-4" /> Generar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">124</div>
                <p className="text-xs text-muted-foreground">+4.3% desde el período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Producto Más Vendido</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Laptop HP</div>
                <p className="text-xs text-muted-foreground">15 unidades vendidas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Productos con Bajo Stock</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Requieren reabastecimiento</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reporte de Productos</CardTitle>
              <CardDescription>Genere reportes detallados de productos en el período seleccionado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-medium">Información incluida en el reporte:</h3>
                <ul className="list-disc list-inside text-sm">
                  <li>Listado de productos con detalles</li>
                  <li>Productos más vendidos</li>
                  <li>Productos con bajo stock</li>
                  <li>Análisis de ventas por categoría</li>
                  <li>Rotación de inventario</li>
                </ul>
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleGenerarExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Generar Excel
                </Button>
                <Button onClick={handleGenerarPDF}>
                  <FilePdf className="mr-2 h-4 w-4" /> Generar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48</div>
                <p className="text-xs text-muted-foreground">+12.2% desde el período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Cliente con Mayor Compra</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Juan Pérez</div>
                <p className="text-xs text-muted-foreground">$2,345.67 en compras</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">En el período seleccionado</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reporte de Clientes</CardTitle>
              <CardDescription>Genere reportes detallados de clientes en el período seleccionado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-medium">Información incluida en el reporte:</h3>
                <ul className="list-disc list-inside text-sm">
                  <li>Listado de clientes con detalles</li>
                  <li>Clientes con mayor volumen de compra</li>
                  <li>Nuevos clientes en el período</li>
                  <li>Frecuencia de compra por cliente</li>
                  <li>Análisis de retención de clientes</li>
                </ul>
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleGenerarExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Generar Excel
                </Button>
                <Button onClick={handleGenerarPDF}>
                  <FilePdf className="mr-2 h-4 w-4" /> Generar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
