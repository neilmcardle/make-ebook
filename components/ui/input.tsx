"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  focusPlaceholder?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, placeholder, focusPlaceholder = "", ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        placeholder={isFocused ? focusPlaceholder : placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }