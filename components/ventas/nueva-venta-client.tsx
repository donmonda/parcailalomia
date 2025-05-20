"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2, Save } from "lucide-react"
import type { Producto, Cliente } from "@/lib/types"

interface NuevaVentaClientProps {
  productos: Producto[]
  clientes: Cliente[]
}

// Primero, definimos una interfaz para el tipo de item
interface VentaItem {
  id: number;         // ID temporal para el frontend
  productoId: string; // _id de MongoDB
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export default function NuevaVentaClient({ productos, clientes }: NuevaVentaClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [clienteId, setClienteId] = useState("")
  const [items, setItems] = useState<VentaItem[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState("")
  const [cantidad, setCantidad] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const nuevoTotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    setTotal(nuevoTotal)
  }, [items])

  const handleAgregarProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) {
      toast({
        title: "Error",
        description: "Seleccione un producto y una cantidad válida",
        variant: "destructive",
      })
      return
    }

    const producto = productos.find((p) => p.sku === productoSeleccionado)

    if (!producto) {
      toast({
        title: "Error",
        description: "Producto no encontrado",
        variant: "destructive",
      })
      return
    }

    if (cantidad > producto.stock) {
      toast({
        title: "Error",
        description: `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles.`,
        variant: "destructive",
      })
      return
    }

    const itemExistente = items.find((item) => item.productoId === producto._id)

    if (itemExistente) {
      const itemsActualizados = items.map((item) => {
        if (item.productoId === producto._id) {
          return {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: nuevaCantidad * producto.precio,
          }
        }
        return item
      })

      setItems(itemsActualizados)
    } else {
      const nuevoItem = {
        id: Date.now(),
        productoId: producto._id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: cantidad,
        subtotal: cantidad * producto.precio,
      }

      setItems([...items, nuevoItem])
    }

    // Limpiar selección después de agregar
    setProductoSeleccionado("")
    setCantidad(1)
  }

  const handleEliminarItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  // En el selector de clientes
  <div className="space-y-2">
    <Label htmlFor="cliente">Cliente</Label>
    <Select value={clienteId} onValueChange={setClienteId}>
      <SelectTrigger id="cliente">
        <SelectValue placeholder="Seleccionar cliente" />
      </SelectTrigger>
      <SelectContent>
        {clientes.map((cliente) => (
          <SelectItem key={cliente._id} value={cliente._id}>
            {cliente.nombre} - {cliente.rfc}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  // En la función handleGuardarVenta
  const handleGuardarVenta = async () => {
    if (!clienteId) {
      toast({
        title: "Error",
        description: "Seleccione un cliente para continuar",
        variant: "destructive",
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Agregue al menos un producto a la venta",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const ventaData = {
        cliente: clienteId, // Cambiado de clienteId a cliente
        items: items.map((item) => ({
          producto: item.productoId, // Cambiado de productoId a producto
          cantidad: item.cantidad,
          precio: item.precio // Cambiado de precioUnitario a precio
        })),
        total: total * 1.16,
        subtotal: total,
        iva: total * 0.16,
        estado: "completada" // Agregado estado por defecto
      }

      const response = await fetch("/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ventaData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear la venta")
      }

      toast({
        title: "Éxito",
        description: "La venta ha sido registrada exitosamente",
      })

      router.push("/ventas")
    } catch (error) {
      console.error("Error al guardar venta:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la venta",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Nueva Venta</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detalles de la Venta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger id="cliente">
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente._id} value={cliente._id}>
                      {cliente.nombre} - {cliente.rfc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-end space-x-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="producto">Producto</Label>
                  <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
                    <SelectTrigger id="producto">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map((producto) => (
                        <SelectItem key={producto.sku} value={producto.sku}>
                          {producto.nombre} - ${producto.precio.toFixed(2)} (Stock: {producto.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-2">
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(Number.parseInt(e.target.value) || 1)}
                  />
                </div>
                <Button 
                  onClick={handleAgregarProducto}
                  disabled={!productoSeleccionado || cantidad <= 0}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        No hay productos agregados
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.nombre}</TableCell>
                        <TableCell className="text-right">${item.precio.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.cantidad}</TableCell>
                        <TableCell className="text-right">${item.subtotal.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEliminarItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (16%):</span>
              <span>${(total * 0.16).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${(total * 1.16).toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleGuardarVenta}
              disabled={items.length === 0 || !clienteId}
            >
              {isLoading ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Venta
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
