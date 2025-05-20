"use client"

import type React from "react"
import type { Producto } from "@/lib/types"

import { useState } from "react"
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
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Search, Pencil, Trash2, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

interface ProductosClientProps {
  initialProductos: Producto[]
}

export default function ProductosClient({ initialProductos }: ProductosClientProps) {
  const [productos, setProductos] = useState<Producto[]>(initialProductos)
  const [busqueda, setBusqueda] = useState("")
  const [productoActual, setProductoActual] = useState<Partial<Producto> | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imagen, setImagen] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const productosFiltrados = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.sku.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(busqueda.toLowerCase()),
  )

  const handleNuevoProducto = () => {
    setProductoActual({
      nombre: "",
      sku: "",
      precio: 0,
      stock: 0,
      categoria: "",
      descripcion: "",
      imagenUrl: "",
      videoUrl: "",
    })
    setImagen(null)
    setVideo(null)
    setIsDialogOpen(true)
  }

  const handleEditarProducto = (producto: Producto) => {
    setProductoActual({ ...producto })
    setImagen(null)
    setVideo(null)
    setIsDialogOpen(true)
  }

  const handleEliminarProducto = (producto: Producto) => {
    setProductoActual(producto)
    setIsDeleteDialogOpen(true)
  }

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagen(e.target.files[0])
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0])
    }
  }

  const handleGuardarProducto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productoActual) return

    setIsLoading(true)

    try {
      const formData = new FormData()

      // Añadir datos del producto
      Object.entries(productoActual).forEach(([key, value]) => {
        if (key !== "imagenUrl" && key !== "videoUrl") {
          formData.append(key, String(value))
        }
      })

      // Añadir archivos si existen
      if (imagen) {
        formData.append("imagen", imagen)
      }

      if (video) {
        formData.append("video", video)
      }

      let response

      if (!productoActual.sku) {
        // Crear nuevo producto
        response = await fetch("/api/productos", {
          method: "POST",
          body: formData,
        })
      } else {
        // Actualizar producto existente
        response = await fetch(`/api/productos/${productoActual.sku}`, {
          method: "PUT",
          body: formData,
        })
      }

      if (!response.ok) {
        throw new Error("Error al guardar el producto")
      }

      const productoGuardado = await response.json()
      
      // Actualizar la lista de productos
      if (!productoActual.sku) {
        setProductos([...productos, productoGuardado])
      } else {
        setProductos(productos.map((p) => (p.sku === productoActual.sku ? productoGuardado : p)))
      }

      toast({
        title: "Éxito",
        description: "Producto guardado exitosamente",
      })
      
      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error al guardar producto:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el producto. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const confirmarEliminarProducto = async () => {
    if (!productoActual?.sku) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/productos/${productoActual.sku}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el producto")
      }

      setProductos(productos.filter((p) => p.sku !== productoActual.sku))
      toast({
        title: "Producto eliminado",
        description: `El producto ${productoActual.nombre} ha sido eliminado exitosamente.`,
        variant: "destructive",
      })
      setIsDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el producto. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <Button onClick={handleNuevoProducto}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos..."
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
              <TableHead>Imagen</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              productosFiltrados.map((producto) => (
                <TableRow key={producto.sku}>
                  <TableCell>
                    {producto.imagenUrl ? (
                      <div className="relative w-12 h-12">
                        <Image
                          src={producto.imagenUrl || "/placeholder.svg"}
                          alt={producto.nombre}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                        <ImageIcon className="text-gray-400 w-6 h-6" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{producto.sku}</TableCell>
                  <TableCell>{producto.nombre}</TableCell>
                  <TableCell>{producto.categoria}</TableCell>
                  <TableCell className="text-right">${producto.precio.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{producto.stock}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditarProducto(producto)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleEliminarProducto(producto)}
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

      {/* Diálogo para crear/editar producto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{productoActual?.id ? "Editar Producto" : "Crear Producto"}</DialogTitle>
            <DialogDescription>Complete los detalles del producto y guarde los cambios.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGuardarProducto}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={productoActual?.sku || ""}
                    onChange={(e) => setProductoActual({ ...productoActual, sku: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Input
                    id="categoria"
                    value={productoActual?.categoria || ""}
                    onChange={(e) => setProductoActual({ ...productoActual, categoria: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={productoActual?.nombre || ""}
                  onChange={(e) => setProductoActual({ ...productoActual, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={productoActual?.descripcion || ""}
                  onChange={(e) => setProductoActual({ ...productoActual, descripcion: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productoActual?.precio || ""}
                    onChange={(e) =>
                      setProductoActual({
                        ...productoActual,
                        precio: Number.parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={productoActual?.stock || ""}
                    onChange={(e) =>
                      setProductoActual({
                        ...productoActual,
                        stock: Number.parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imagen">Imagen del Producto</Label>
                  <div className="flex items-center gap-2">
                    <Input id="imagen" type="file" accept="image/*" onChange={handleImagenChange} />
                    {productoActual?.imagenUrl && !imagen && (
                      <div className="relative w-10 h-10">
                        <Image
                          src={productoActual.imagenUrl || "/placeholder.svg"}
                          alt="Vista previa"
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video">Video del Producto (opcional)</Label>
                  <Input id="video" type="file" accept="video/*" onChange={handleVideoChange} />
                  {productoActual?.videoUrl && !video && (
                    <p className="text-xs text-muted-foreground">
                      Video actual: {productoActual.videoUrl.split("/").pop()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar el producto "{productoActual?.nombre}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarEliminarProducto} disabled={isLoading}>
              {isLoading ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

