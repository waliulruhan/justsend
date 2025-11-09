import { DataGrid } from '@mui/x-data-grid';
import React from 'react';

import './shared.css'



const Table = ({ rows, columns, heading, rowHeight = 52 }) => {
    return (
        <div className='table'>
                <p>{heading}</p>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    rowHeight={rowHeight}
                    style={{
                        height: "80%",
                    }}
                    sx={{
                        border: "none",
                        ".table-header": {
                        bgcolor: 'black',
                        color: "white",
                        },
                    }}
                />
        </div>
    );
};

export default Table;