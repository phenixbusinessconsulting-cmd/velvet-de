"use client"

import { useState, useTransition, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Loader2 } from "lucide-react"
import { CityRow } from "./city-row"
import { reorderCities } from "./actions"

interface City {
  id: string
  nameDE: string
  nameEN: string
  slug: string
  state: string
  stateCode: string
  sortOrder: number
  isActive: boolean
  showOnLanding: boolean
  taglineDE: string | null
  taglineFR: string | null
  _count: { profiles: number }
}

function SortableCityRow({ city }: { city: City }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: city.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <tr ref={setNodeRef} style={style} className="relative">
      {/* Drag handle cell */}
      <td className="pl-2 pr-0 py-3 w-8">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors touch-none"
          title="Glisser pour réordonner"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <CityRow city={city} inSortable />
    </tr>
  )
}

interface Props {
  initialCities: City[]
}

export function CitySortableList({ initialCities }: Props) {
  const [cities, setCities] = useState(initialCities)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setCities(initialCities)
  }, [initialCities])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = cities.findIndex((c) => c.id === active.id)
    const newIndex = cities.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(cities, oldIndex, newIndex)

    // Optimistic update
    setCities(reordered)

    // Persist new order
    startTransition(async () => {
      await reorderCities(reordered.map((c, i) => ({ id: c.id, sortOrder: i + 1 })))
    })
  }

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Loader2 className="w-3 h-3 animate-spin" />
          Sauvegarde…
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={cities.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="w-8" />
                {["#", "Nom", "Slug", "État", "Taglines DE / FR", "Statut", "Profils", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] tracking-widest uppercase text-[var(--text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => (
                <SortableCityRow key={city.id} city={city} />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  )
}
