import { Menu, Stack } from '@mui/material';
import React, { useEffect } from 'react';
import { useMyContext } from '../../utils/context';
import { Delete, ExitToApp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAsyncMutation } from '../../hooks/hook';
import axios from 'axios';
import { server } from '../constants/config';
import { useMutation } from '@tanstack/react-query';

const DeleteChatMenu = ({deleteAnchor}) => {
    const navigate = useNavigate()

    const leaveGroupMutation = useMutation({
        mutationFn: async (chatId) => {
              const { data } = await axios.delete(`${server}/api/v1/chat/leave/${chatId}`,{ withCredentials: true });
              return data
            }
    }) 
    const deleChatMutation = useMutation({
        mutationFn: async (chatId) => {
              const { data } = await axios.delete(`${server}/api/v1/chat/${chatId}`,{ withCredentials: true });
              return data
            }
    })  



    const [ executeLeaveGroup, _  , leaveGroupData ] = useAsyncMutation(leaveGroupMutation);
    const [ executeDeleteChat, __  , deleteChatData ] = useAsyncMutation(deleChatMutation);

    const {isDeleteMenu , setIsDeleteMenu , selectedDeleteChat , setSelectedDeleteChat}= useMyContext()
    const isGroup = selectedDeleteChat.groupChat;
    
    useEffect(()=>{
        if(leaveGroupData || deleteChatData) navigate('/')
    },[leaveGroupData , deleteChatData])

    const deleteChatHandler=()=>{
        setIsDeleteMenu(false)
        executeDeleteChat('Deleting chat',selectedDeleteChat.chatId)
    }
    const leaveGroupHandler=()=>{
        setIsDeleteMenu(false)
        executeLeaveGroup('Leaving group..',selectedDeleteChat.chatId)
    }
    return (
        <Menu anchorOrigin={{vertical:'bottom' ,  horizontal:"right"}} transformOrigin={{vertical:'center' , horizontal:'center'}} open={isDeleteMenu} onClose={()=> setIsDeleteMenu(false)} anchorEl={deleteAnchor.current} >
            <Stack            
                direction={'row'}
                spacing={'0'}
                alignItems={'center'}
                justifyContent={'center'}
                sx={{
                    width: '10rem',
                    padding: "0.2rem",
                    cursor: 'pointer'
                }} 
                onClick={isGroup ? leaveGroupHandler : deleteChatHandler}
            >
            {
                isGroup ?(
                    <>
                    <ExitToApp/><p>Leave Group</p>
                    </>
                ):(
                    <>
                    <Delete/><p>Delete Chat</p>
                    </>

                )
            }
            </Stack>
        </Menu>
    );
};

export default DeleteChatMenu;