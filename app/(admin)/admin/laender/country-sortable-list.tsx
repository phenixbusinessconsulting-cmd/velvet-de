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
import { CountryRow, type CountryData } from "./country-row"
import { reorderCountries } from "./actions"

function SortableCountryRow({ country }: { country: CountryData }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: country.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <tr ref={setNodeRef} style={style} className="relative">
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
      <CountryRow country={country} inSortable />
    </tr>
  )
}

export function CountrySortableList({ initialCountries }: { initialCountries: CountryData[] }) {
  const [countries, setCountries] = useState(initialCountries)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setCountries(initialCountries)
  }, [initialCountries])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = countries.findIndex((c) => c.id === active.id)
    const newIndex = countries.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(countries, oldIndex, newIndex)

    setCountries(reordered)
    startTransition(async () => {
      await reorderCountries(reordered.map((c, i) => ({ id: c.id, sortOrder: i + 1 })))
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
        <SortableContext items={countries.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="w-8" />
                {["#", "Drapeau", "Nom", "Code", "Slug", "Statut", "Villes", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] tracking-widest uppercase text-[var(--text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {countries.map((country) => (
                <SortableCountryRow key={country.id} country={country} />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  )
}
