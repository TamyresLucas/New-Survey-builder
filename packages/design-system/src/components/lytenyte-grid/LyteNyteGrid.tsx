import { useId } from 'react';
import { Grid, useClientRowDataSource } from '@1771technologies/lytenyte-core';
import type { Column, RowLayout, SortModelItem, RowDetailRendererFn } from '@1771technologies/lytenyte-core/types';
import '@1771technologies/lytenyte-core/grid.css';
import './lytenyte-grid.css';

export type LyteNyteGridProps<T = any> = {
    /** Column definitions */
    columns: Column<T>[];
    /** Row data array */
    data: T[];
    /** Grid height in pixels */
    height?: number;
    /** Grid width (number for px or string for %, etc.) */
    width?: number | string;
    /** Initial sort configuration */
    sortModel?: SortModelItem<T>[];
    /** Filter model for column filtering */
    filterModel?: Record<string, any>;
    /** Row selection mode */
    rowSelectionMode?: 'single' | 'multi' | 'none';
    /** Array of column IDs for row grouping */
    rowGroupModel?: string[];
    /** Cell edit mode */
    editCellMode?: 'readonly' | 'cell';
    /** Row detail renderer function */
    rowDetailRenderer?: RowDetailRendererFn<T>;
    /** Row detail height */
    rowDetailHeight?: number;
    /** Row height */
    rowHeight?: number;
    /** Header height */
    headerHeight?: number;
};

export function LyteNyteGrid<T>({
    columns,
    data,
    height = 400,
    width = '100%',
    sortModel,
    filterModel,
    rowSelectionMode,
    rowGroupModel,
    editCellMode = 'readonly',
    rowDetailRenderer,
    rowDetailHeight,
    rowHeight = 35,
    headerHeight = 40,
}: LyteNyteGridProps<T>) {
    const gridId = useId();
    const ds = useClientRowDataSource<T>({ data });

    const grid = Grid.useLyteNyte({
        gridId,
        columns,
        rowDataSource: ds,
        rowHeight,
        headerHeight,
        // Optional features
        ...(sortModel && { sortModel }),
        ...(filterModel && { filterModel }),
        ...(rowSelectionMode && rowSelectionMode !== 'none' && {
            rowSelectionMode: rowSelectionMode === 'multi' ? 'multiple' : 'single',
            rowSelectionActivator: 'single-click',
        }),
        ...(rowGroupModel && {
            rowGroupModel,
            rowGroupDefaultExpansion: 1,
            rowGroupDisplayMode: 'single-column',
        }),
        ...(editCellMode === 'cell' && {
            editCellMode,
            editClickActivator: 'double-click',
        }),
        ...(rowDetailRenderer && { rowDetailRenderer, rowDetailHeight: rowDetailHeight ?? 200 }),
    });

    const view = grid.view.useValue();

    return (
        <div className="lng-grid" style={{ height, width, overflow: 'hidden', position: 'relative' }}>
            <Grid.Root grid={grid}>
                <Grid.Viewport>
                    <Grid.Header>
                        {view.header.layout.map((row, i) => (
                            <Grid.HeaderRow key={i} headerRowIndex={i}>
                                {row.map((c) =>
                                    c.kind === 'group' ? (
                                        <Grid.HeaderGroupCell key={c.idOccurrence} cell={c} />
                                    ) : (
                                        <Grid.HeaderCell key={c.id} cell={c} />
                                    )
                                )}
                            </Grid.HeaderRow>
                        ))}
                    </Grid.Header>
                    <Grid.RowsContainer>
                        <RowSection rows={view.rows.top} section="top" />
                        <RowSection rows={view.rows.center} section="center" />
                        <RowSection rows={view.rows.bottom} section="bottom" />
                    </Grid.RowsContainer>
                </Grid.Viewport>
            </Grid.Root>
        </div>
    );
}

function RowSection<D = any>({
    section,
    rows,
}: {
    rows: RowLayout<D>[];
    section: 'top' | 'center' | 'bottom';
}) {
    const Section =
        section === 'top' ? Grid.RowsTop : section === 'bottom' ? Grid.RowsBottom : Grid.RowsCenter;

    return (
        <Section>
            {rows.map((row) => {
                if (row.kind === 'full-width') return <Grid.RowFullWidth key={row.id} row={row} />;
                return (
                    <Grid.Row row={row} key={row.id}>
                        {row.cells.map((c) => (
                            <Grid.Cell
                                key={c.id}
                                cell={c}
                                data-ln-editable={c.column.editable ? 'true' : undefined}
                            />
                        ))}
                    </Grid.Row>
                );
            })}
        </Section>
    );
}

// Re-export types for convenience
export type { Column } from '@1771technologies/lytenyte-core/types';
