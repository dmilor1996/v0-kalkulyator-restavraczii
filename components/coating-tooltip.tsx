"use client"

import { HelpCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile" // Fixed import to use correct hook

interface CoatingTooltipProps {
  type: "oil" | "lacquer" | "milling"
}

export function CoatingTooltip({ type }: CoatingTooltipProps) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile() // Using useIsMobile instead of useMediaQuery

  const content = {
    oil: "Масло-воск Osmo TopOil (Германия), износостойкое покрытие для столешниц, требует обновления примерно раз в 2-3 года, в зависимости от интенсивности использования поверхности, легко обслуживать и обновлять поверхность. 7 цветов на выбор.",
    lacquer:
      "Двухкомпонентный профессиональный акриловый лак Alcea (Италия), не желтеет со временем, прочное покрытие пригодное для применения даже на полу. Как и любой другой лак сложен в обновлении, требует полной реставрации в случае повреждения.",
    milling: "Фрезеровка кромки, канавок, доп работы",
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-muted transition-colors ml-1"
          aria-label="Информация о покрытии"
          onMouseEnter={() => !isMobile && setOpen(true)}
          onMouseLeave={() => !isMobile && setOpen(false)}
          onClick={(e) => {
            if (isMobile) {
              e.preventDefault()
              setOpen(!open)
            }
          }}
        >
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm" side="top">
        <p className="text-foreground leading-relaxed">{content[type]}</p>
      </PopoverContent>
    </Popover>
  )
}
