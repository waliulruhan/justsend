import { Avatar, IconButton } from '@mui/material';
import React, { memo } from 'react';
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import './shared.css'
import { transformImage } from '../../lib/features';
const UserItem = ({
    user,
    handler,
    handlerIsLoading,
    isAdded= false,
    disabled= false,

}) => {
    const { avatar , _id , name} =user;

    return (
        <div className="userItem">
            <Avatar src={transformImage(avatar)} />
            <p>{name}</p>
            <IconButton
                size="small"
                sx={{
                    bgcolor: isAdded ? "error.main" : "#66a22e",
                    color: "white",
                    "&:hover": {
                    bgcolor: isAdded ? "error.dark" : "#447515",
                    },
                }}
                onClick={() => handler(_id)}
                disabled={handlerIsLoading}
                >
                {isAdded ? <RemoveIcon /> : <AddIcon />}
        </IconButton>
        </div>
    );
};

export default memo(UserItem);