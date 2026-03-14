import React from "react";

type RowKey<T> = keyof T | ((row: T, rowIndex: number) => React.Key);

type CellAccessor<T> = keyof T | ((row: T) => React.ReactNode);

type CellRenderer<T> = (row: T, rowIndex: number) => React.ReactNode;

export type TableColumn<T> = {
  key: string;
  header: React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  cellClassNameFn?: (row: T, rowIndex: number) => string | undefined;
  render?: CellRenderer<T>;
  accessor?: CellAccessor<T>;
  isRowHeader?: boolean;
};

interface ReusableTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  rowKey: RowKey<T>;
  tableClassName?: string;
  theadClassName?: string;
  tbodyClassName?: string;
  rowClassName?: string | ((row: T, rowIndex: number) => string | undefined);
}

const ReusableTable = <T,>({
  data,
  columns,
  rowKey,
  tableClassName,
  theadClassName,
  tbodyClassName,
  rowClassName,
}: ReusableTableProps<T>) => {
  const resolveRowKey = (row: T, rowIndex: number) => {
    if (typeof rowKey === "function") {
      return rowKey(row, rowIndex);
    }

    const keyValue = (row as Record<string, React.Key>)[rowKey as string];
    return keyValue ?? rowIndex;
  };

  const resolveRowClassName = (row: T, rowIndex: number) =>
    typeof rowClassName === "function" ? rowClassName(row, rowIndex) : rowClassName;

  const resolveCellContent = (column: TableColumn<T>, row: T, rowIndex: number) => {
    if (column.render) {
      return column.render(row, rowIndex);
    }

    if (column.accessor) {
      return typeof column.accessor === "function"
        ? column.accessor(row)
        : (row as Record<string, React.ReactNode>)[column.accessor as string];
    }

    return null;
  };

  return (
    <table className={tableClassName}>
      <thead className={theadClassName}>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col" className={column.headerClassName}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={tbodyClassName}>
        {data.map((row, rowIndex) => (
          <tr key={resolveRowKey(row, rowIndex)} className={resolveRowClassName(row, rowIndex)}>
            {columns.map((column) => {
              const cellClassName = column.cellClassNameFn
                ? column.cellClassNameFn(row, rowIndex)
                : column.cellClassName;
              const cellContent = resolveCellContent(column, row, rowIndex);

              if (column.isRowHeader) {
                return (
                  <th key={column.key} scope="row" className={cellClassName}>
                    {cellContent}
                  </th>
                );
              }

              return (
                <td key={column.key} className={cellClassName}>
                  {cellContent}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReusableTable;
