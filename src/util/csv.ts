export type CsvRows = {
  rows: string[][]
  columns: number
}
export function toCsv ({ rows, columns }: CsvRows): Blob {
  const emptyRow = Array.from({ length: columns }, () => '')
  return new Blob(
    [
      rows
        .map(
          row =>
            [...row, ...emptyRow]
              .slice(0, columns)
              .map(cell =>
                /,\n"/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell
              )
              .join(',') + '\n'
        )
        .join('')
    ],
    { type: 'text/csv' }
  )
}
