import { Close, Done } from '@mui/icons-material';
import { Dialog, IconButton } from '@mui/material';
import React from 'react';

const ConfirmDialog = ({header='' , content='', handler , open = false , handleClose }) => {
    const dialogStyle = {
        maxHeight: "100dvh",
        maxWidth: '100vw',
        height:'40vh',
        width:'40vw',
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        backgroundColor: '#eff9e8',
        };
    return (
        <Dialog
         open={open}
         onClose={()=> handleClose(false)}
         PaperProps={{ sx: dialogStyle }} 
         >
            <p style={{margin:5, fontWeight:800,fontSize:'1.2rem' }} >{header}</p>
            <p style={{margin:5, fontWeight:500,fontSize:'1rem' }} >{content}</p>
            <div className='flex-con' style={{flexGrow:1}}>
            <IconButton
                size="small"
                sx={{
                    bgcolor:  "#66a22e",
                    color: "white",
                    "&:hover": {
                        bgcolor: "#447515",
                    },
                }}
                onClick={() => handler()}
                >
                    <Done/>
             </IconButton>
             <IconButton
                size="small"
                sx={{
                    bgcolor:"error.main" ,
                    color: "white",
                    "&:hover": {
                    bgcolor: "error.dark" ,
                    },
                    marginLeft:'15px'
                }}
                onClick={()=>handleClose(false)}
                >
                    <Close/>
             </IconButton>
            </div>
        </Dialog>
    );
};

export default ConfirmDialog;