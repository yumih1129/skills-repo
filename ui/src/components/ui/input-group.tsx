import * as React from "react"
import { cn } from "@/lib/utils"

function InputGroup({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn("relative flex items-center", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function InputGroupAddon({ className, children, side = "left", ...props }: React.ComponentProps<"span"> & { side?: "left" | "right" }) {
  return (
    <span
      data-slot="input-group-addon"
      data-side={side}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 flex items-center justify-center z-10",
        side === "left" ? "left-2.5" : "right-1",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input-group-input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon, InputGroupInput }
