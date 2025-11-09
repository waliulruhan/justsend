
import { Box } from '@mui/material';
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarCard from './AvatarCard';
import {motion} from "framer-motion"
import { useMyContext } from '../../utils/context';

const ChatItem = ({
    avatar =[],
    name,
    _id,
    groupChat = false,
    sameSender,
    isChatOnline,
    newAlert,
    index = 0,
    handleDeleteChat,
    isOnline,
}) => {
    const navigate = useNavigate();

    const { setIsChatoverview } = useMyContext();

    const chatItemVariants ={
      hidden: {
          x:-50,
          scale:.85,
          opacity: 0,
        },
        visible: {
          x:0,  
          opacity: 1,
          scale:1,
          transition: {
            duration: 0.15,
        },
        },
    };

    return (
        <motion.div 
        variants={chatItemVariants}
        whileHover={{scale:1.03}}
        whileTap={{scale:.95}}

          onContextMenu={(e)=> handleDeleteChat(e , _id , groupChat )}
          onClick={()=>{ navigate(`/chat/${_id}`) ; setIsChatoverview(false)}}
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            backgroundColor: sameSender ? "#1A3D64" : "#1D546C",
            color: sameSender ? "white" : "unset",
            position: "relative",
            padding: "10px",
            width:'100%',
            borderRadius:'10px',
            justifyContent:'center',
          }}
        >
            <AvatarCard isOnline={isOnline} avatar={avatar} />
            <div style={{width:"90%" , overflow:"hidden"}}>
              <p style={{fontSize:"13px", fontWeight:"600", margin:"0px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth:"90%" }}>{name}</p>
              {
                newAlert &&  
                <p style={{fontSize:"10px" , fontWeight:"400", margin:"0px" , }}>{newAlert.count} new message</p>
              }
            </div>
        {isChatOnline && (
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#22223b",
              position: "absolute",
              top: "50%",
              right: "1rem",
              transform: "translateY(-50%)",
            }}
          />
        )}
        </motion.div>
    );
};

export default memo(ChatItem);