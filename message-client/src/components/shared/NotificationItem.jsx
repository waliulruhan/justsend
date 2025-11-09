import React, { memo } from 'react';
import './shared.css'
import { Avatar, IconButton } from '@mui/material';
import { Close, Done } from '@mui/icons-material';
import { transformImage } from '../../lib/features';
const NotificationItem = memo(({sender , _id , handler})=>{
    const {name , avatar} = sender;
    return (
        <div className="userItem">
            <Avatar src={transformImage(avatar)} />
            <p>{name}</p>
            <IconButton
                size="small"
                sx={{
                    bgcolor:  "#66a22e",
                    color: "white",
                    "&:hover": {
                    bgcolor: "#447515",
                    },
                }}
                onClick={() => handler({_id , accept : true})}
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
                    marginLeft:'5px'
                }}
                onClick={() => handler({_id , accept : false})}
                >
                    <Close/>
             </IconButton>
        </div>
    );
})

export default memo(NotificationItem);