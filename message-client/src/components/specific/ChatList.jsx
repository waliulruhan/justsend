import { Stack } from '@mui/material';
import React from 'react';
import ChatItem from '../shared/ChatItem';
import { useMyContext } from '../../utils/context';
import {motion} from "framer-motion"

const ChatList = ({
    chats=[],
    chatId,
    chatOnlineUsers = [],
    onlineUsers=[],
    newMessageAlert = [
        {
            chatId: '',
            count: 0,
        }
    ],
    w="100%",
    handleDeleteChat,
}) => {
    const { myData, setIsChatoverview } = useMyContext();
    
    const chatListVariants = {
        hidden: {
          opacity: 1,
      },
      visible: {
          opacity: 1,
          transition: {
              when: "beforeChildren",
              staggerChildren: 0.1,
          },
      },
    };
    return (
            <motion.div
            variants={chatListVariants}
            initial="hidden"
            animate="visible"

            //  height={'100%'}
            //   overflow={'auto'}
            //    width={w}
            //     bgcolor='#f7fdf0'
            style={{
                flexDirection:'column',
                width:w ,
                display:"flex",
                padding:'5px',
                height:'100%',
                overflowY: 'scroll',
                flex: 1,
                gap:"10px",
            }}
            className=''  
            >
                {!chats.length ?  <p style={{textAlign:"center"}}>No chats</p>  : chats.map((data ,i)=>{
                    const {avatar , name , _id , groupChat , members} = data;
                    const newAlert = newMessageAlert.find(
                        ({ chatId }) => chatId === _id
                      );
                      const isChatOnline = members?.some((member) => member !== myData._id && chatOnlineUsers.includes(member) );
                      const isOnline = members?.some((member) => member !== myData._id && onlineUsers.includes(member))
                    return <ChatItem
                    index={i}
                     newAlert={newAlert}
                     isChatOnline={isChatOnline}  
                     isOnline={isOnline}
                      avatar = {avatar}
                      name={name}
                      _id={_id}
                      key={_id}
                      groupChat = {groupChat}
                      sameSender ={chatId === _id}
                      handleDeleteChat={handleDeleteChat}
                      />
                })}
            </motion.div>
    );
};

export default ChatList;