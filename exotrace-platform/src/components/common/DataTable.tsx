import type { ReactNode } from 'react'

export interface TableRow {
  id: string
  cells: ReactNode[]
}

export function DataTable({ headers, rows }: { headers: string[]; rows: TableRow[] }) {
  return <div className="table-scroll"><table className="data-table">
    <thead><tr>{headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead>
    <tbody>{rows.map((row) => <tr key={row.id}>{row.cells.map((cell, index) => <td key={`${row.id}-${index}`}>{cell}</td>)}</tr>)}</tbody>
  </table></div>
}