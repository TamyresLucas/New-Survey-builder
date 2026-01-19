import type { Meta, StoryObj } from '@storybook/react';
import {
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  DonutChart,
  CHART_COLORS,
  SEMANTIC_CHART_COLORS,
} from './ui/chart';

const meta: Meta = {
  title: 'Components/Data Display/Charts',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// Sample data for charts
const monthlyData = [
  { month: 'Jan', sales: 4000, revenue: 2400, profit: 1200 },
  { month: 'Feb', sales: 3000, revenue: 1398, profit: 900 },
  { month: 'Mar', sales: 2000, revenue: 9800, profit: 1500 },
  { month: 'Apr', sales: 2780, revenue: 3908, profit: 1100 },
  { month: 'May', sales: 1890, revenue: 4800, profit: 800 },
  { month: 'Jun', sales: 2390, revenue: 3800, profit: 1300 },
  { month: 'Jul', sales: 3490, revenue: 4300, profit: 1600 },
];

const categoryData = [
  { name: 'Product A', value: 400 },
  { name: 'Product B', value: 300 },
  { name: 'Product C', value: 200 },
  { name: 'Product D', value: 278 },
  { name: 'Product E', value: 189 },
];

const surveyResponseData = [
  { response: 'Very Satisfied', count: 45 },
  { response: 'Satisfied', count: 32 },
  { response: 'Neutral', count: 18 },
  { response: 'Dissatisfied', count: 8 },
  { response: 'Very Dissatisfied', count: 5 },
];

// ============ BAR CHARTS ============

export const BarChartDefault: StoryObj = {
  name: 'Bar Chart - Default',
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Monthly Sales</h3>
      <BarChart
        data={monthlyData}
        xAxisKey="month"
        bars={[{ dataKey: 'sales', name: 'Sales' }]}
      />
    </div>
  ),
};

export const BarChartMultiple: StoryObj = {
  name: 'Bar Chart - Multiple Bars',
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sales vs Revenue</h3>
      <BarChart
        data={monthlyData}
        xAxisKey="month"
        bars={[
          { dataKey: 'sales', name: 'Sales' },
          { dataKey: 'revenue', name: 'Revenue' },
        ]}
      />
    </div>
  ),
};

export const BarChartStacked: StoryObj = {
  name: 'Bar Chart - Stacked',
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Stacked Revenue Breakdown</h3>
      <BarChart
        data={monthlyData}
        xAxisKey="month"
        bars={[
          { dataKey: 'profit', name: 'Profit', stackId: 'a' },
          { dataKey: 'revenue', name: 'Revenue', stackId: 'a' },
        ]}
      />
    </div>
  ),
};

export const BarChartHorizontal: StoryObj = {
  name: 'Bar Chart - Horizontal',
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Survey Responses</h3>
      <BarChart
        data={surveyResponseData}
        xAxisKey="response"
        bars={[{ dataKey: 'count', name: 'Responses' }]}
        layout="vertical"
        height={300}
      />
    </div>
  ),
};

export const BarChartSemanticColors: StoryObj = {
  name: 'Bar Chart - Semantic Colors',
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Performance Metrics</h3>
      <BarChart
        data={[
          { metric: 'Completed', value: 85 },
          { metric: 'In Progress', value: 45 },
          { metric: 'Failed', value: 12 },
          { metric: 'Pending', value: 28 },
        ]}
        xAxisKey="metric"
        bars={[
          { dataKey: 'value', name: 'Count', color: SEMANTIC_CHART_COLORS.primary },
        ]}
      />
    </div>
  ),
};

// ============ LINE CHARTS ============

export const LineChartDefault: StoryObj = {
  name: 'Line Chart - Default',
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sales Trend</h3>
      <LineChart
        data={monthlyData}
        xAxisKey="month"
        lines={[{ dataKey: 'sales', name: 'Sales' }]}
      />
    </div>
  ),
};

export const LineChartMultiple: StoryObj = {
  name: 'Line Chart - Multiple Lines',
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Performance Comparison</h3>
      <LineChart
        data={monthlyData}
        xAxisKey="month"
        lines={[
          { dataKey: 'sales', name: 'Sales' },
          { dataKey: 'revenue', name: 'Revenue' },
          { dataKey: 'profit', name: 'Profit' },
        ]}
      />
    </div>
  ),
};

export const LineChartStraight: StoryObj = {
  name: 'Line Chart - Straight Lines',
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Linear Trend</h3>
      <LineChart
        data={monthlyData}
        xAxisKey="month"
        lines={[{ dataKey: 'sales', name: 'Sales' }]}
        curved={false}
      />
    </div>
  ),
};

// ============ AREA CHARTS ============

export const AreaChartDefault: StoryObj = {
  name: 'Area Chart - Default',
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Revenue Over Time</h3>
      <AreaChart
        data={monthlyData}
        xAxisKey="month"
        areas={[{ dataKey: 'revenue', name: 'Revenue' }]}
      />
    </div>
  ),
};

export const AreaChartStacked: StoryObj = {
  name: 'Area Chart - Stacked',
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
      <AreaChart
        data={monthlyData}
        xAxisKey="month"
        areas={[
          { dataKey: 'profit', name: 'Profit', stackId: 'a' },
          { dataKey: 'sales', name: 'Sales', stackId: 'a' },
        ]}
      />
    </div>
  ),
};

// ============ PIE CHARTS ============

export const PieChartDefault: StoryObj = {
  name: 'Pie Chart - Default',
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Product Distribution</h3>
      <PieChart data={categoryData} />
    </div>
  ),
};

export const PieChartWithLabels: StoryObj = {
  name: 'Pie Chart - With Labels',
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Market Share</h3>
      <PieChart
        data={categoryData}
        showLabels
        outerRadius={100}
        height={400}
      />
    </div>
  ),
};

export const DonutChartDefault: StoryObj = {
  name: 'Donut Chart - Default',
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Survey Results</h3>
      <DonutChart
        data={surveyResponseData.map(item => ({
          name: item.response,
          value: item.count,
        }))}
      />
    </div>
  ),
};

export const DonutChartCustomColors: StoryObj = {
  name: 'Donut Chart - Semantic Colors',
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Status Overview</h3>
      <DonutChart
        data={[
          { name: 'Success', value: 65, color: SEMANTIC_CHART_COLORS.success },
          { name: 'Warning', value: 20, color: SEMANTIC_CHART_COLORS.warning },
          { name: 'Error', value: 15, color: SEMANTIC_CHART_COLORS.destructive },
        ]}
      />
    </div>
  ),
};

// ============ DASHBOARD EXAMPLE ============

export const DashboardExample: StoryObj = {
  name: 'Dashboard - Combined Charts',
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
          <BarChart
            data={monthlyData}
            xAxisKey="month"
            bars={[{ dataKey: 'revenue', name: 'Revenue' }]}
            height={250}
            showLegend={false}
          />
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
          <LineChart
            data={monthlyData}
            xAxisKey="month"
            lines={[{ dataKey: 'sales', name: 'Sales' }]}
            height={250}
            showLegend={false}
          />
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-4">Product Distribution</h3>
          <DonutChart
            data={categoryData}
            height={250}
          />
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-4">Performance Over Time</h3>
          <AreaChart
            data={monthlyData}
            xAxisKey="month"
            areas={[
              { dataKey: 'profit', name: 'Profit' },
            ]}
            height={250}
            showLegend={false}
          />
        </div>
      </div>
    </div>
  ),
};

// ============ COLOR PALETTE DEMO ============

export const ChartColorPalette: StoryObj = {
  name: 'Chart Color Palette',
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Chart Colors (from Design Tokens)</h3>
        <div className="flex gap-4">
          {CHART_COLORS.map((color, index) => (
            <div key={index} className="text-center">
              <div
                className="w-16 h-16 rounded-lg shadow-sm border"
                style={{ backgroundColor: color }}
              />
              <p className="text-xs text-muted-foreground mt-2">Chart {index + 1}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Semantic Colors</h3>
        <div className="flex gap-4">
          {Object.entries(SEMANTIC_CHART_COLORS).map(([name, color]) => (
            <div key={name} className="text-center">
              <div
                className="w-16 h-16 rounded-lg shadow-sm border"
                style={{ backgroundColor: color }}
              />
              <p className="text-xs text-muted-foreground mt-2 capitalize">{name}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">All Colors in Action</h3>
        <BarChart
          data={[
            { category: 'A', value1: 30, value2: 45, value3: 25, value4: 60, value5: 40 },
            { category: 'B', value1: 45, value2: 30, value3: 55, value4: 35, value5: 50 },
            { category: 'C', value1: 60, value2: 55, value3: 40, value4: 45, value5: 35 },
          ]}
          xAxisKey="category"
          bars={[
            { dataKey: 'value1', name: 'Series 1' },
            { dataKey: 'value2', name: 'Series 2' },
            { dataKey: 'value3', name: 'Series 3' },
            { dataKey: 'value4', name: 'Series 4' },
            { dataKey: 'value5', name: 'Series 5' },
          ]}
          height={300}
        />
      </div>
    </div>
  ),
};
