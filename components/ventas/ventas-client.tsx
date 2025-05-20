"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Search, FileText, RotateCcw, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import type { Venta } from "@/lib/types"

interface VentasClientProps {
  initialVentas: Venta[]
}

export default function VentasClient({ initialVentas }: VentasClientProps) {
  const [ventas, setVentas] = useState<Venta[]>(initialVentas)
  const [busqueda, setBusqueda] = useState("")
  const [ventaActual, setVentaActual] = useState<Venta | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const ventasFiltradas = ventas.filter(
    (venta) =>
      venta.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
      venta.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      venta.fecha.includes(busqueda),
  )

  const handleVerDetalles = (venta: Venta) => {
    setVentaActual(venta)
    setIsDetailsDialogOpen(true)
  }

  const handleDevolucion = async (venta: Venta) => {
    if (venta.estado === "devuelta") {
      toast({
        title: "Error",
        description: "Esta venta ya ha sido devuelta.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/ventas/${venta.id}/devolucion`, {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error("Error al procesar la devolución")
      }

      const ventaActualizada = await response.json()

      setVentas(ventas.map((v) => (v.id === venta.id ? ventaActualizada : v)))

      toast({
        title: "Devolución procesada",
        description: `La venta ${venta.numero} ha sido marcada como devuelta.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error al procesar devolución:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la devolución. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEliminarVenta = (venta: Venta) => {
    setVentaActual(venta)
    setIsDeleteDialogOpen(true)
  }

  const confirmarEliminarVenta = async () => {
    if (!ventaActual) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/ventas/${ventaActual.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la venta")
      }

      setVentas(ventas.filter((v) => v.id !== ventaActual.id))

      toast({
        title: "Venta eliminada",
        description: `La venta ${ventaActual.numero} ha sido eliminada exitosamente.`,
        variant: "destructive",
      })

      setIsDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error al eliminar venta:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar la venta. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "completada":
        return <Badge className="bg-green-500">Completada</Badge>
      case "devuelta":
        return <Badge className="bg-red-500">Devuelta</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Ventas</h1>
        <Button asChild>
          <Link href="/ventas/nueva">
            <Plus className="mr-2 h-4 w-4" /> Nueva Venta
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar ventas..."
            className="pl-8"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ventasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No se encontraron ventas
                </TableCell>
              </TableRow>
            ) : (
              ventasFiltradas.map((venta) => (
                <TableRow key={venta.id}>
                  <TableCell className="font-medium">{venta.numero}</TableCell>
                  <TableCell>{formatDate(venta.fecha)}</TableCell>
                  <TableCell>{venta.cliente.nombre}</TableCell>
                  <TableCell>{getEstadoBadge(venta.estado)}</TableCell>
                  <TableCell className="text-right">${venta.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleVerDetalles(venta)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-amber-500"
                        onClick={() => handleDevolucion(venta)}
                        disabled={venta.estado === "devuelta" || isLoading}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleEliminarVenta(venta)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo para ver detalles de venta */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Detalles de Venta - {ventaActual?.numero}</DialogTitle>
            <DialogDescription>Información detallada de la venta</DialogDescription>
          </DialogHeader>
          {ventaActual && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Cliente</p>
                  <p>{ventaActual.cliente.nombre}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Fecha</p>
                  <p>{formatDate(ventaActual.fecha)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Estado</p>
                  <p>{getEstadoBadge(ventaActual.estado)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="font-bold">${ventaActual.total.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Productos</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ventaActual.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.producto.nombre}</TableCell>
                          <TableCell className="text-right">{item.cantidad}</TableCell>
                          <TableCell className="text-right">${item.precio.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${item.subtotal.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar la venta "{ventaActual?.numero}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarEliminarVenta} disabled={isLoading}>
              {isLoading ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
