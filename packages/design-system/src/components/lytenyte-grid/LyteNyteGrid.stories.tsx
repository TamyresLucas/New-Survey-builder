import type { Meta, StoryObj } from '@storybook/react';
import { LyteNyteGrid, type Column } from './LyteNyteGrid';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

const meta: Meta<typeof LyteNyteGrid> = {
    title: 'Components/DataGrid',
    component: LyteNyteGrid,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: `
A high-performance React data grid powered by **LyteNyte Grid** (headless).

## Features
- Virtualized rendering for large datasets
- Column sorting and filtering
- Row selection (single/multi)
- Column pinning
- Inline cell editing
- Row grouping
                `,
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LyteNyteGrid>;

// ============================================
// Different Data Types for Each Story
// ============================================

interface Employee {
    id: number;
    name: string;
    department: string;
    salary: number;
    startDate: string;
}

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
}

interface Order {
    orderId: string;
    customer: string;
    product: string;
    quantity: number;
    status: string;
}

// ============================================
// Story 1: Basic Employee Table
// ============================================

const employeeColumns: Column<Employee>[] = [
    { id: 'id', name: 'ID', width: 60 },
    { id: 'name', name: 'Employee Name', widthFlex: 2 },
    { id: 'department', name: 'Department', width: 120 },
    { id: 'salary', name: 'Salary', type: 'number', width: 100 },
    { id: 'startDate', name: 'Start Date', width: 110 },
];

const employees: Employee[] = [
    { id: 1, name: 'Alice Johnson', department: 'Engineering', salary: 95000, startDate: '2020-03-15' },
    { id: 2, name: 'Bob Smith', department: 'Marketing', salary: 72000, startDate: '2019-07-22' },
    { id: 3, name: 'Carol Williams', department: 'Engineering', salary: 110000, startDate: '2018-01-10' },
    { id: 4, name: 'David Brown', department: 'Sales', salary: 68000, startDate: '2021-11-05' },
    { id: 5, name: 'Eve Davis', department: 'HR', salary: 62000, startDate: '2022-02-28' },
];

/**
 * Basic employee data table with simple columns.
 */
export const EmployeeTable: Story = {
    args: {
        columns: employeeColumns,
        data: employees,
        height: 300,
    },
};

// ============================================
// Story 2: Product Inventory
// ============================================

const productColumns: Column<Product>[] = [
    { id: 'id', name: 'SKU', width: 70 },
    { id: 'name', name: 'Product', widthFlex: 2 },
    { id: 'category', name: 'Category', width: 120 },
    { id: 'price', name: 'Price ($)', type: 'number', width: 90 },
    { id: 'stock', name: 'In Stock', type: 'number', width: 80 },
];

const products: Product[] = [
    { id: 101, name: 'Wireless Mouse', category: 'Electronics', price: 29.99, stock: 150 },
    { id: 102, name: 'USB-C Hub', category: 'Electronics', price: 49.99, stock: 75 },
    { id: 103, name: 'Standing Desk', category: 'Furniture', price: 399.00, stock: 12 },
    { id: 104, name: 'Monitor Arm', category: 'Furniture', price: 89.99, stock: 45 },
    { id: 105, name: 'Mechanical Keyboard', category: 'Electronics', price: 129.00, stock: 200 },
    { id: 106, name: 'Desk Lamp', category: 'Lighting', price: 34.99, stock: 88 },
];

/**
 * Product inventory with different data structure.
 */
export const ProductInventory: Story = {
    args: {
        columns: productColumns,
        data: products,
        height: 350,
    },
};

// ============================================
// Story 3: Orders with Pinned Columns
// ============================================

const orderColumns: Column<Order>[] = [
    { id: 'orderId', name: 'Order ID', width: 100, pin: 'start' },
    { id: 'customer', name: 'Customer', widthFlex: 2 },
    { id: 'product', name: 'Product', widthFlex: 2 },
    { id: 'quantity', name: 'Qty', type: 'number', width: 60 },
    { id: 'status', name: 'Status', width: 100, pin: 'end' },
];

const orders: Order[] = [
    { orderId: 'ORD-001', customer: 'Acme Corp', product: 'Wireless Mouse', quantity: 50, status: 'Shipped' },
    { orderId: 'ORD-002', customer: 'TechStart', product: 'USB-C Hub', quantity: 25, status: 'Pending' },
    { orderId: 'ORD-003', customer: 'BigRetail', product: 'Standing Desk', quantity: 10, status: 'Delivered' },
    { orderId: 'ORD-004', customer: 'SmallBiz', product: 'Desk Lamp', quantity: 100, status: 'Processing' },
];

/**
 * Order management table with Order ID pinned left and Status pinned right.
 * Scroll horizontally to see pinned columns stay fixed.
 */
export const OrdersWithPinnedColumns: Story = {
    args: {
        columns: orderColumns,
        data: orders,
        height: 280,
        width: 500, // Narrow width to show horizontal scroll
    },
};

// ============================================
// Story 4: Large Dataset (Virtualization Demo)
// ============================================

const generateLargeDataset = (count: number): Employee[] => {
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `Employee #${i + 1}`,
        department: departments[i % departments.length],
        salary: 50000 + Math.floor(Math.random() * 80000),
        startDate: `202${i % 5}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    }));
};

/**
 * Demonstrates virtualization with 500 rows.
 * Scroll to see smooth performance with large data.
 */
export const LargeDataset500Rows: Story = {
    args: {
        columns: employeeColumns,
        data: generateLargeDataset(500),
        height: 400,
    },
};

// ============================================
// Story 5: Editable Cells
// ============================================

const editableProductColumns: Column<Product>[] = [
    { id: 'id', name: 'SKU', width: 70 },
    { id: 'name', name: 'Product', widthFlex: 2, editable: true },
    { id: 'category', name: 'Category', width: 120, editable: true },
    { id: 'price', name: 'Price ($)', type: 'number', width: 90, editable: true },
    { id: 'stock', name: 'In Stock', type: 'number', width: 80, editable: true },
];

/**
 * Double-click any cell (except SKU) to edit.
 * Press Enter to confirm or Escape to cancel.
 */
export const EditableCells: Story = {
    args: {
        columns: editableProductColumns,
        data: products,
        height: 350,
        editCellMode: 'cell',
    },
};

// ============================================
// Story 6: Row Selection with Checkboxes
// ============================================

// Checkbox column for row selection
const selectionColumns: Column<Employee>[] = [
    {
        id: '_select',
        name: '',
        width: 40,
        cellRenderer: ({ row, grid }) => {
            const selectedIds = grid.state.rowSelectedIds.useValue();
            const isSelected = row?.id ? selectedIds.has(row.id) : false;

            return (
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => { }}
                    onClick={(ev) => {
                        ev.stopPropagation();
                        grid.api.rowHandleSelect({ shiftKey: ev.shiftKey, target: ev.target });
                    }}
                    style={{ cursor: 'pointer' }}
                />
            );
        },
    },
    { id: 'id', name: 'ID', width: 60 },
    { id: 'name', name: 'Employee Name', widthFlex: 2 },
    { id: 'department', name: 'Department', width: 120 },
    { id: 'salary', name: 'Salary', type: 'number', width: 100 },
    { id: 'startDate', name: 'Start Date', width: 110 },
];

/**
 * Click checkboxes to select rows. Use Shift+Click for range selection.
 * Rows also highlight when selected.
 */
export const RowSelection: Story = {
    args: {
        columns: selectionColumns,
        data: employees,
        height: 300,
        rowSelectionMode: 'multi',
    },
};

// ============================================
// Story 7: Row Grouping by Department
// ============================================

/**
 * Rows grouped by department. Click the expand/collapse icons to toggle groups.
 */
export const RowGrouping: Story = {
    args: {
        columns: employeeColumns,
        data: [
            ...employees,
            { id: 6, name: 'Frank Lee', department: 'Engineering', salary: 88000, startDate: '2021-06-15' },
            { id: 7, name: 'Grace Chen', department: 'Marketing', salary: 75000, startDate: '2020-09-01' },
            { id: 8, name: 'Henry Kim', department: 'Sales', salary: 71000, startDate: '2022-04-20' },
        ],
        height: 400,
        rowGroupModel: ['department'],
    },
};

// ============================================
// Story 8: Custom Cell Renderers
// ============================================

interface OrderWithStatus {
    id: number;
    product: string;
    amount: number;
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
}

const ordersWithStatus: OrderWithStatus[] = [
    { id: 1, product: 'Laptop Pro', amount: 1299.99, status: 'delivered' },
    { id: 2, product: 'Wireless Earbuds', amount: 149.99, status: 'shipped' },
    { id: 3, product: 'USB Cable', amount: 12.99, status: 'pending' },
    { id: 4, product: 'Monitor 27"', amount: 399.99, status: 'cancelled' },
    { id: 5, product: 'Keyboard', amount: 89.99, status: 'shipped' },
];

// Status colors using design tokens
const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'hsl(var(--chart-4) / 0.2)', text: 'hsl(var(--chart-4))' },
    shipped: { bg: 'hsl(var(--primary) / 0.15)', text: 'hsl(var(--primary))' },
    delivered: { bg: 'hsl(var(--chart-2) / 0.2)', text: 'hsl(var(--chart-2))' },
    cancelled: { bg: 'hsl(var(--destructive) / 0.15)', text: 'hsl(var(--destructive))' },
};

// Status badge renderer
const StatusCell = ({ value }: { value: string }) => (
    <span
        style={{
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 500,
            backgroundColor: statusColors[value]?.bg ?? 'hsl(var(--muted))',
            color: statusColors[value]?.text ?? 'hsl(var(--muted-foreground))',
        }}
    >
        {value}
    </span>
);

// Currency renderer
const CurrencyCell = ({ value }: { value: number | undefined }) => (
    <span style={{ fontFamily: 'monospace' }}>
        {value != null ? `$${value.toFixed(2)}` : '—'}
    </span>
);

const customRendererColumns: Column<OrderWithStatus>[] = [
    { id: 'id', name: 'Order #', width: 80 },
    { id: 'product', name: 'Product', widthFlex: 2 },
    {
        id: 'amount',
        name: 'Amount',
        type: 'number',
        width: 100,
        cellRenderer: ({ value }) => <CurrencyCell value={value as number} />,
    },
    {
        id: 'status',
        name: 'Status',
        width: 110,
        cellRenderer: ({ value }) => <StatusCell value={value as string} />,
    },
];

/**
 * Custom cell renderers: Status badges with colors, Currency formatting.
 */
export const CustomCellRenderers: Story = {
    args: {
        columns: customRendererColumns,
        data: ordersWithStatus,
        height: 300,
    },
};

// ============================================
// Story 9: Row Actions (Selection + Actions Menu)
// ============================================

// Icon names from Google Material Symbols (not hardcoded)
const ICONS = {
    moreVert: 'more_vert',
    edit: 'edit',
    delete: 'delete',
    contentCopy: 'content_copy',
    visibility: 'visibility',
} as const;

// Material icon component
const Icon = ({ name, size = 20 }: { name: string; size?: number }) => (
    <span
        className="material-symbols-rounded"
        style={{ fontSize: size, lineHeight: 1 }}
    >
        {name}
    </span>
);

import { TableRowActions } from '../ui/table-row-actions';

// Row actions cell renderer using standard component
const RowActionsCell = ({ row }: { row: Employee | undefined }) => {
    if (!row) return null;

    // Simulate different action counts for demonstration if needed, 
    // or just standard set. I'll use standard set to show dropdown.
    // To show single button, we could filter.

    return (
        <TableRowActions
            actions={[
                {
                    label: 'View Details',
                    icon: ICONS.visibility,
                    onClick: () => console.log('View', row)
                },
                {
                    label: 'Edit',
                    icon: ICONS.edit,
                    onClick: () => console.log('Edit', row)
                },
                {
                    label: 'Duplicate',
                    icon: ICONS.contentCopy,
                    onClick: () => console.log('Duplicate', row)
                },
                {
                    label: 'Delete',
                    icon: ICONS.delete,
                    onClick: () => console.log('Delete', row),
                    variant: 'destructive',
                    separatorBefore: true
                },
            ]}
        />
    );
};

// Columns with checkbox selection + actions
const rowActionsColumns: Column<Employee>[] = [
    {
        id: '_select',
        name: '',
        width: 40,
        cellRenderer: ({ row, grid }) => {
            const selectedIds = grid.state.rowSelectedIds.useValue();
            const isSelected = row?.id ? selectedIds.has(row.id) : false;

            return (
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => { }}
                    onClick={(ev) => {
                        ev.stopPropagation();
                        grid.api.rowHandleSelect({ shiftKey: ev.shiftKey, target: ev.target });
                    }}
                    style={{ cursor: 'pointer' }}
                />
            );
        },
    },
    { id: 'id', name: 'ID', width: 60 },
    { id: 'name', name: 'Employee Name', widthFlex: 2 },
    { id: 'department', name: 'Department', width: 120 },
    { id: 'salary', name: 'Salary', type: 'number', width: 100 },
    {
        id: '_actions',
        name: '',
        width: 60,
        cellRenderer: ({ row }) => <RowActionsCell row={row as Employee} />,
    },
];

/**
 * Row selection with checkbox + action menu for each row.
 * Actions include View, Edit, Duplicate, and Delete.
 * Only appears in grids with row selection enabled.
 */
export const RowActions: Story = {
    args: {
        columns: rowActionsColumns,
        data: employees,
        height: 350,
        rowSelectionMode: 'multi',
    },
};
