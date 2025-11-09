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
import ChatHeader from './ChatHeader';
import ChatOverview from '../specific/ChatOverview';
import { AnimatePresence } from 'framer-motion';
const ChatLayout = () => (WrappedComponent) => {
    return(props)=>{
        const {chatId} =useParams()
        
        
        const socket = getSocket() ;

        const [chatOnlineUsers , setChatOnlineUsers] = useState([])
        const [onlineUsers , setOnlineUsers] = useState([])
        const [chatDetails, setChatDetails] = useState({})
        
        const [isChatDetailsLoading, setIsChatDetailsLoading] = useState(false)

        const {isChatoverview,setIsChatoverview, setSelectedDeleteChat,isDeleteMenu , setIsDeleteMenu, isMobileChat , setIsMobileChat , myData , setMyData , notificationCount,setNotificationCount , newMessageAlert , setNewMessageAlert}= useMyContext()
        
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

        
    //     const userData = useQuery({
    //         queryKey: ['user-data', chatDetails?.members], // Ensure re-fetching on member changes
    //         queryFn: async () => {
    //             if (chatDetails?.members && !chatDetails.groupChat) {
    //                 const otherMember = chatDetails.members.find(member => member.toString() !== myData._id);
    //                 if (!otherMember) return null; // Return a safe default value
        
    //                 try {
    //                     const { data } = await axios.post(
    //                         `${server}/api/v1/user/get-user-info`,
    //                         { userId: otherMember },
    //                         { withCredentials: true }
    //                     );
    //                     return data.user;
    //                 } catch (error) {
    //                     console.error("Error fetching user data:", error);
    //                     throw new Error("Failed to fetch user data");
    //                 }
    //             }
    //             return null; // Return default value if conditions are not met
    //         },
    //     });
    //    useEffect(()=>{
    //         if(friends?.length > 0 && myData._id){
    //             socket.emit(ONLINE_USERS , {friends:[ ...friends , myData._id]})
    //         }
    //     },[friends , myData])


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
            // [NEW_REQUEST]: newRequestListener , 
            [REFETCH_CHATS]: refetchListener,
            [CHAT_ONLINE_USERS]: chatOnlineUsersListener,
            [ONLINE_USERS]: onlineUsersListener,
        }
        
          useSocketEvents(socket, eventHandler)
      
          
        const fetchChatDetails = async () => {
            setIsChatDetailsLoading(true);
        try {
            const { data } = await axios.get(`${server}/api/v1/chat/${chatId}`, { withCredentials: true });
            setChatDetails(data.chat);
        } catch (err) {
            notifyError(err.response.data.message || "Something went wrong")
        }finally{
            setIsChatDetailsLoading(false)
        }
        };  

        useEffect(()=>{
            fetchChatDetails();
            return ()=>{
                setChatDetails({})
            }
        },[chatId])
        
        return(
            <>
                <Title/>           
                <ChatHeader chatDetails={chatDetails} isChatDetailsLoading={isChatDetailsLoading} />
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
                        
                        <AnimatePresence>
                            {isChatoverview && <ChatOverview chatId={chatId}  chatDetails={chatDetails}  isChatDetailsLoading={isChatDetailsLoading} />}
                        </AnimatePresence>

                        <WrappedComponent {...props} chatId={chatId} chatDetails={chatDetails}/>
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

export default ChatLayout;