import React, { useCallback, useEffect, useRef, useState } from 'react';
import Header from './Header';
import Title from '../shared/Title';
import './layout.css'
import ChatList from '../specific/ChatList'
import { samepleChats } from '../constants/sampleData';
import { useParams } from 'react-router-dom';
import { Drawer, Skeleton } from '@mui/material';
import { useMyContext } from '../../utils/context';
import { server } from '../constants/config';
import axios from 'axios';
import { getSocket } from '../../utils/socketContext';
import { useSocketEvents } from '../../hooks/hook';
import { CHAT_ONLINE_USERS, NEW_MESSAGE_ALERT, NEW_REQUEST, ONLINE_USERS, REFETCH_CHATS } from '../constants/event';
import { getOrSaveFromStorage } from '../../lib/features';
import { useQuery } from '@tanstack/react-query';
import DeleteChatMenu from '../dialogs/DeleteChatMenu';
import {notifyError} from "../../lib/Toasting"
import { useInputValidation } from '6pp';
import { CommonLoader } from './Loaders';
const AppLayout = () => (WrappedComponent) => {
    return(props)=>{
        const {chatId} =useParams()
        
        
        const socket = getSocket() ;

        const [chatOnlineUsers , setChatOnlineUsers] = useState([])
        const [onlineUsers , setOnlineUsers] = useState([])

        const {setSelectedDeleteChat,isDeleteMenu , setIsDeleteMenu, isMobileChat , setIsMobileChat , myData , setMyData , notificationCount,setNotificationCount , newMessageAlert , setNewMessageAlert}= useMyContext()
        
        const deleteMenuAnchor = useRef(null)

        const handleDeleteChat =(e ,chatId , groupChat)=>{
            e.preventDefault()
            deleteMenuAnchor.current = e.currentTarget;
            setIsDeleteMenu(true)
            setSelectedDeleteChat({chatId , groupChat})
        }

        const nameRegex = useInputValidation("");
        
        const { data : allChats ,refetch , isLoading} = useQuery({
            queryKey: ['chats'],
            queryFn: async () => {
                try {
                    const {data} = await axios.get(`${server}/api/v1/chat/mychats?name=${nameRegex.value}` , {withCredentials: true});
                    return data.chats
                  } catch (error) {
                      notifyError(error.response.data.message || "Something went wrong")
                    } finally {
                  }
                }
            } ); 
            
            useEffect(()=>{
                const timeOutId = setTimeout(()=>{
                    refetch()
                },1000)
                return ()=>{
                    clearTimeout(timeOutId)
                }
            },[nameRegex.value])

        useEffect(() => {
            axios.get(`${server}/api/v1/user/me`, {withCredentials: true})
            .then(res => setMyData(res.data.user))
            .catch(err => console.log(err) );

          }, []);

        useEffect(()=>{
            getOrSaveFromStorage({key: 'NEW_MESSAGE_ALERT' , value: newMessageAlert })
        },[newMessageAlert])  
        useEffect(()=>{
            getOrSaveFromStorage({key: 'NOTIFICATION_COUNT' , value: notificationCount })
        },[notificationCount])  


        const { data: friends  } = useQuery({
            queryKey: ['friends'],
            queryFn: async () => {
                const res = await axios.get(`${server}/api/v1/user/friends`, { withCredentials: true });
                return res.data.friends.map(friend => friend._id);
            },
        });

       useEffect(()=>{
            if(friends?.length > 0 && myData._id){
                socket.emit(ONLINE_USERS , {friends:[ ...friends , myData._id]})
            }
        },[friends , myData])


          // socket event handling
          const newMessageAlertListener = useCallback((data) => {
            if(data.chatId === chatId) return ;
              
              const index = newMessageAlert.findIndex( item => item.chatId == data.chatId);
                if (index !== -1){
                    const updatedAlerts = [...newMessageAlert];
                    updatedAlerts[index] = {
                        ...updatedAlerts[index],
                        count: updatedAlerts[index].count + 1
                    };
                    setNewMessageAlert(updatedAlerts);
                }else{
                    setNewMessageAlert(prevAlerts => [
                        ...prevAlerts,
                        { chatId: data.chatId, count: 1 }
                    ]);
                }
          }, [newMessageAlert , chatId])

          const newRequestListener = useCallback((data) => {
            setNotificationCount(prev => prev + 1)
          }, [])
          const refetchListener = useCallback((data) => {
            refetch()
          }, [])
          const chatOnlineUsersListener = useCallback((data) => {
            setChatOnlineUsers(data)
          }, [])
          const onlineUsersListener = (data)=>{
            setOnlineUsers(data)
          }
          
          const eventHandler = { 
            [NEW_MESSAGE_ALERT]: newMessageAlertListener , 
            [NEW_REQUEST]: newRequestListener , 
            [REFETCH_CHATS]: refetchListener,
            [CHAT_ONLINE_USERS]: chatOnlineUsersListener,
            [ONLINE_USERS]: onlineUsersListener,
        }
        
          useSocketEvents(socket, eventHandler)
        
        
        return(
            <>
                <Title/>           
                <Header/>
                <DeleteChatMenu deleteAnchor={deleteMenuAnchor}/>
                <div className="layout ">
                    <div className="layout-side">
                        <div className='input-div'>
                            <input value={nameRegex.value} onChange={nameRegex.changeHandler}  type="text" className="input-field" placeholder='search' name='username'/>
                        </div>
                        {
                            isLoading ? 
                            <CommonLoader />
                            :
                            <ChatList 
                             handleDeleteChat={handleDeleteChat}
                             chats={allChats}  
                             chatId={chatId} 
                             chatOnlineUsers={chatOnlineUsers}
                             onlineUsers={onlineUsers}
                             newMessageAlert={newMessageAlert} 
                             />
                        }
                    </div>
                    <div className="layout-main">
                        <WrappedComponent {...props} chatId={chatId}/>
                    </div>
                </div>
                <Drawer 
                    open={isMobileChat}
                    onClose={()=> setIsMobileChat(false)}
    

                >
                    <div className='layout-side-drawer'>
                        <div className='input-div'>
                            <input value={nameRegex.value} onChange={nameRegex.changeHandler}  type="text" className="input-field" placeholder='search' name='username'/>
                        </div>
                    {
                        isLoading ? 
                        <CommonLoader/>
                        :
                        <ChatList
                            newMessageAlert={newMessageAlert} 
                            handleDeleteChat={handleDeleteChat}
                            chats={allChats}
                            chatId={chatId} 
                            chatOnlineUsers={chatOnlineUsers}
                            onlineUsers={onlineUsers}
                            w={'60vw'}
                            />
                    }
                    </div>

                </Drawer>

            </>
        )
    }
};

export default AppLayout;