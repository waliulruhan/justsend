import React, { useState } from 'react';
import { getOrSaveFromStorage } from '../lib/features';

const MyContext = React.createContext();

export const MyContextProvider = ({ children }) => {
   const [isSearch , setIsSearch ] = useState(false)
   const [isNewGroup , setIsNewGroup ] = useState(false)
   const [isNotification , setIsNotification ] = useState(false)
   const [isMobile , setIsMobie ] = useState(false)
   const [isMobileChat , setIsMobileChat] = useState(false)
   const [myData , setMyData] = useState({})
   const [isAdmin , setIsAdmin] = useState(false)
   const [isDeleteMenu , setIsDeleteMenu] = useState(false)
   const [isChatoverview , setIsChatoverview] = useState(false)
   const [selectedDeleteChat , setSelectedDeleteChat] = useState({})
   

   const [notificationCount , setNotificationCount] = useState(getOrSaveFromStorage({key: "NOTIFICATION_COUNT" , get: true }) || 0)
   const [newMessageAlert , setNewMessageAlert] = useState(
    getOrSaveFromStorage({key: "NEW_MESSAGE_ALERT" , get: true }) || [
    {
      chatId: "",
      count: 0,
    }
   ]
   )



 const data= { isChatoverview, setIsChatoverview, selectedDeleteChat , setSelectedDeleteChat ,isDeleteMenu , setIsDeleteMenu ,newMessageAlert , setNewMessageAlert , notificationCount , setNotificationCount , myData , setMyData , isMobileChat , setIsMobileChat , isAdmin , setIsAdmin ,isNewGroup , setIsNewGroup , isSearch , setIsSearch , isMobile , setIsMobie ,isNotification , setIsNotification }


  return (
    <MyContext.Provider value={data}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => {
  return React.useContext(MyContext);
};

export default MyContext;
