import React from "react";
export default function DataTable({ headers, rows, getCells }) {
  return (
    <table className="data">
      <thead>
        <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {getCells(row).map((cell, j) => (
              <td
                key={j}
                className={
                  String(cell).startsWith("+")
                    ? "positive"
                    : String(cell).startsWith("-")
                    ? "negative"
                    : ""
                }
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
