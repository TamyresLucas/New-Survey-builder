import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { TableRowActions } from './ui/table-row-actions';

const meta = {
    title: 'Components/Data Display/Table',
    component: Table,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

// === DEFAULT ===

const invoices = [
    { invoice: "INV001", paymentStatus: "Paid", totalAmount: "$250.00", paymentMethod: "Credit Card" },
    { invoice: "INV002", paymentStatus: "Pending", totalAmount: "$150.00", paymentMethod: "PayPal" },
    { invoice: "INV003", paymentStatus: "Unpaid", totalAmount: "$350.00", paymentMethod: "Bank Transfer" },
    { invoice: "INV004", paymentStatus: "Paid", totalAmount: "$450.00", paymentMethod: "Credit Card" },
    { invoice: "INV005", paymentStatus: "Paid", totalAmount: "$550.00", paymentMethod: "PayPal" },
    { invoice: "INV006", paymentStatus: "Pending", totalAmount: "$200.00", paymentMethod: "Bank Transfer" },
    { invoice: "INV007", paymentStatus: "Unpaid", totalAmount: "$300.00", paymentMethod: "Credit Card" },
];

export const Default: Story = {
    render: () => (
        <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                        <TableCell>{invoice.paymentStatus}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    ),
};

// === WITH FOOTER ===

export const WithFooter: Story = {
    render: () => (
        <Table>
            <TableCaption>Invoice summary with total.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.slice(0, 5).map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                        <TableCell>{invoice.paymentStatus}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right font-bold">$1,600.00</TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    ),
};

// === WITH BADGES ===

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Paid":
            return <Badge variant="success">Paid</Badge>;
        case "Pending":
            return <Badge variant="secondary">Pending</Badge>;
        case "Unpaid":
            return <Badge variant="destructive">Unpaid</Badge>;
        default:
            return <Badge>{status}</Badge>;
    }
};

export const WithBadges: Story = {
    render: () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                        <TableCell>{getStatusBadge(invoice.paymentStatus)}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    ),
};

// === WITH SELECTION ===

const SelectableTable = () => {
    const [selected, setSelected] = React.useState<string[]>([]);

    const toggleAll = () => {
        if (selected.length === invoices.length) {
            setSelected([]);
        } else {
            setSelected(invoices.map(i => i.invoice));
        }
    };

    const toggle = (id: string) => {
        setSelected(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    return (
        <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
                {selected.length} of {invoices.length} selected
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40px]">
                            <Checkbox
                                checked={selected.length === invoices.length}
                                onCheckedChange={toggleAll}
                            />
                        </TableHead>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow
                            key={invoice.invoice}
                            data-state={selected.includes(invoice.invoice) && "selected"}
                        >
                            <TableCell>
                                <Checkbox
                                    checked={selected.includes(invoice.invoice)}
                                    onCheckedChange={() => toggle(invoice.invoice)}
                                />
                            </TableCell>
                            <TableCell className="font-medium">{invoice.invoice}</TableCell>
                            <TableCell>{invoice.paymentStatus}</TableCell>
                            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export const WithSelection: Story = {
    render: () => <SelectableTable />,
};

// === WITH ACTIONS ===

export const WithActions: Story = {
    render: () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.slice(0, 5).map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                        <TableCell>{getStatusBadge(invoice.paymentStatus)}</TableCell>
                        <TableCell>{invoice.totalAmount}</TableCell>
                        <TableCell className="text-right">
                            <TableRowActions
                                actions={[
                                    { label: "Edit", onClick: () => console.log("Edit", invoice), icon: "edit" },
                                    { label: "Delete", onClick: () => console.log("Delete", invoice), variant: "destructive", icon: "delete" }
                                ]}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    ),
};

// === SURVEY RESPONSES ===

const surveyResponses = [
    { id: "R001", respondent: "john@example.com", completed: "2024-01-15", score: 8, status: "Complete" },
    { id: "R002", respondent: "jane@example.com", completed: "2024-01-16", score: 9, status: "Complete" },
    { id: "R003", respondent: "bob@example.com", completed: "-", score: null, status: "Partial" },
    { id: "R004", respondent: "alice@example.com", completed: "2024-01-17", score: 7, status: "Complete" },
    { id: "R005", respondent: "charlie@example.com", completed: "-", score: null, status: "Not Started" },
];

export const SurveyResponses: Story = {
    render: () => (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Survey Responses</h3>
                <Button variant="outline" size="sm">Export</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Respondent</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {surveyResponses.map((response) => (
                        <TableRow key={response.id}>
                            <TableCell className="font-mono text-sm">{response.id}</TableCell>
                            <TableCell>{response.respondent}</TableCell>
                            <TableCell>{response.completed}</TableCell>
                            <TableCell>
                                {response.score !== null ? (
                                    <span className="font-medium">{response.score}/10</span>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        response.status === "Complete" ? "success" :
                                            response.status === "Partial" ? "secondary" : "outline"
                                    }
                                >
                                    {response.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <TableRowActions
                                    actions={[
                                        { label: "View", onClick: () => console.log("View", response), icon: "visibility" }
                                    ]}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    ),
};

// === STRIPED ===

export const Striped: Story = {
    render: () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.map((invoice, index) => (
                    <TableRow
                        key={invoice.invoice}
                        className={index % 2 === 0 ? "bg-primary/5" : ""}
                    >
                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                        <TableCell>{invoice.paymentStatus}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    ),
};

// === COMPACT ===

export const Compact: Story = {
    render: () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="py-1">Invoice</TableHead>
                    <TableHead className="py-1">Status</TableHead>
                    <TableHead className="py-1 text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="py-1 font-medium text-sm">{invoice.invoice}</TableCell>
                        <TableCell className="py-1 text-sm">{invoice.paymentStatus}</TableCell>
                        <TableCell className="py-1 text-right text-sm">{invoice.totalAmount}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    ),
};
