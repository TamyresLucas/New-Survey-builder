"use client"

import * as React from "react"
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"

// Get computed CSS variable value
function getCSSVariable(name: string): string {
  if (typeof window === 'undefined') return ''
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value
}

// Dynamic chart colors using CSS variables
export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
] as const

// Dynamic semantic colors using CSS variables
export const SEMANTIC_CHART_COLORS = {
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
} as const

// Get chart color by index - returns CSS variable reference for dynamic theming
export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}

// Get semantic color - returns CSS variable reference for dynamic theming
export function getSemanticColor(name: 'primary' | 'success' | 'warning' | 'destructive'): string {
  return SEMANTIC_CHART_COLORS[name]
}

// Custom Tooltip props type
interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color?: string
  }>
  label?: string
  className?: string
}

// Custom Tooltip component styled with design tokens
export function ChartTooltip({ active, payload, label, className }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className={cn(
      "bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 text-sm",
      className
    )}>
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

// Chart Container wrapper
interface ChartContainerProps {
  children: React.ReactNode
  className?: string
  height?: number | string
}

export function ChartContainer({ children, className, height = 350 }: ChartContainerProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}

// Bar Chart Component
export interface BarChartProps {
  data: Record<string, unknown>[]
  xAxisKey: string
  bars: {
    dataKey: string
    name?: string
    color?: string
    stackId?: string
  }[]
  className?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  layout?: "horizontal" | "vertical"
}

export function BarChart({
  data,
  xAxisKey,
  bars,
  className,
  height = 350,
  showGrid = true,
  showLegend = true,
  layout = "horizontal",
}: BarChartProps) {
  return (
    <ChartContainer className={className} height={height}>
      <RechartsBarChart data={data} layout={layout}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
        )}
        {layout === "horizontal" ? (
          <>
            <XAxis
              dataKey={xAxisKey}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={{ stroke: "var(--border)" }}
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              dataKey={xAxisKey}
              type="category"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={{ stroke: "var(--border)" }}
              width={80}
            />
          </>
        )}
        <Tooltip content={<ChartTooltip />} />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: 12 }}
          />
        )}
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name || bar.dataKey}
            fill={bar.color || getChartColor(index)}
            stackId={bar.stackId}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  )
}

// Line Chart Component
export interface LineChartProps {
  data: Record<string, unknown>[]
  xAxisKey: string
  lines: {
    dataKey: string
    name?: string
    color?: string
    strokeWidth?: number
    dot?: boolean
  }[]
  className?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  curved?: boolean
}

export function LineChart({
  data,
  xAxisKey,
  lines,
  className,
  height = 350,
  showGrid = true,
  showLegend = true,
  curved = true,
}: LineChartProps) {
  return (
    <ChartContainer className={className} height={height}>
      <RechartsLineChart data={data}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
        )}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={{ stroke: "var(--border)" }}
        />
        <YAxis
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={{ stroke: "var(--border)" }}
        />
        <Tooltip content={<ChartTooltip />} />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: 12 }}
          />
        )}
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type={curved ? "monotone" : "linear"}
            dataKey={line.dataKey}
            name={line.name || line.dataKey}
            stroke={line.color || getChartColor(index)}
            strokeWidth={line.strokeWidth || 2}
            dot={line.dot !== false}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  )
}

// Area Chart Component
export interface AreaChartProps {
  data: Record<string, unknown>[]
  xAxisKey: string
  areas: {
    dataKey: string
    name?: string
    color?: string
    fillOpacity?: number
    stackId?: string
  }[]
  className?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
}

export function AreaChart({
  data,
  xAxisKey,
  areas,
  className,
  height = 350,
  showGrid = true,
  showLegend = true,
}: AreaChartProps) {
  return (
    <ChartContainer className={className} height={height}>
      <RechartsAreaChart data={data}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
        )}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={{ stroke: "var(--border)" }}
        />
        <YAxis
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={{ stroke: "var(--border)" }}
        />
        <Tooltip content={<ChartTooltip />} />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: 12 }}
          />
        )}
        {areas.map((area, index) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name || area.dataKey}
            stroke={area.color || getChartColor(index)}
            fill={area.color || getChartColor(index)}
            fillOpacity={area.fillOpacity || 0.3}
            stackId={area.stackId}
          />
        ))}
      </RechartsAreaChart>
    </ChartContainer>
  )
}

// Pie Chart Component
export interface PieChartProps {
  data: {
    name: string
    value: number
    color?: string
  }[]
  className?: string
  height?: number
  innerRadius?: number
  outerRadius?: number
  showLegend?: boolean
  showLabels?: boolean
}

export function PieChart({
  data,
  className,
  height = 350,
  innerRadius = 0,
  outerRadius = 80,
  showLegend = true,
  showLabels = false,
}: PieChartProps) {
  return (
    <ChartContainer className={className} height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          label={showLabels ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : undefined}
          labelLine={showLabels}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || getChartColor(index)}
            />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: 12 }}
          />
        )}
      </RechartsPieChart>
    </ChartContainer>
  )
}

// Donut Chart (Pie with inner radius)
export function DonutChart(props: Omit<PieChartProps, "innerRadius">) {
  return <PieChart {...props} innerRadius={60} outerRadius={80} />
}

export {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  Line,
  Area,
  Pie,
  Cell,
}
