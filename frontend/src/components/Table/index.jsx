import { Table as TableReact } from "reactstrap";
import _ from "lodash";
import styles from "./styles.module.scss";

const Table = ({
  columns = [],
  rows = {
    data: [],
    pagination: {},
  },
}) => {
  const rowsArray = Array.isArray(rows)
    ? rows
    : Array.isArray(rows?.data)
      ? rows.data
      : [];

  return (
    <TableReact hover>
      <thead>
        <tr>
          {columns.map((colum, index) => (
            <th key={index}>{colum}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rowsArray.map((row, index) => {
          return (
            <tr key={index}>
            {
                columns.map((column) => {
                    return <td>{_.get(row, column)}</td>;
                })
            }
            </tr>
          );
        })}
      </tbody>
    </TableReact>
  );
};

export default Table;
