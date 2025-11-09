import React, { Suspense, lazy, useEffect, useState } from 'react';
import './layout.css'
import {
    Add as AddIcon,
    Menu as MenuIcon,
    Search as SearchIcon,
    Group as GroupIcon,
    Logout as LogoutIcon,
    Notifications as NotificationsIcon,
  } from "@mui/icons-material";
import { Backdrop, Badge, IconButton, Tooltip } from '@mui/material';
import { useMyContext } from '../../utils/context';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { server } from '../constants/config';
import { notifyError, notifySuccess } from '../../lib/Toasting';
import Cookies from 'js-cookie';

import logo from '../../assets/image/happinessLogo.png';
import AvatarCard from '../shared/AvatarCard';
import { CommonLoader } from './Loaders';
import moment from 'moment';
import { transformImage } from '../../lib/features';

const SearchDialog = lazy(()=> import("../specific/Search"))
const NotificationsDialog = lazy(()=> import("../specific/Notifications"))
const NewGroupDialog = lazy(()=> import("../specific/NewGroup"))


  const IconBtn = ({ title, icon, onClick, value }) => {
    return (
      <Tooltip title={title}>
        <IconButton color="inherit" size="large" onClick={onClick}>
          {value ? (
            <Badge badgeContent={value} color="success">
              {icon}
            </Badge>
          ) : (
            icon
          )}
        </IconButton>
      </Tooltip>
    );
  };
const ChatHeader = ({chatDetails, isChatDetailsLoading}) => {
  // const {isLoading, data:userInfo} = userData;

  
    const navigate = useNavigate();
    const location = useLocation();
    
    
    const { isMobileChat , setIsMobileChat, setIsChatoverview, myData }= useMyContext()
    

    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
      if (chatDetails && Array.isArray(chatDetails.members)) {
        const foundUser = chatDetails.members.find(i => i._id !== myData._id);
        setUserInfo(foundUser);
      }
    }, [chatDetails, myData]);

    const logoutHandler = async ()=> {
    try {
        const {data} = await axios.get(`${server}/api/v1/user/logout` , {withCredentials: true});
        document.cookie = 'happiness-cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure';
        notifySuccess(data.message)
        navigate('/auth')
    } catch (error) {
        notifyError(error.response.data.message || "Something went wrong")
    }    
    }


    return (
        <div className='header'>
            <div className="header-logo flex-con">
                <p style={{fontWeight:"700"}} onClick={()=>{ location.pathname !== "/" && navigate('/'); setIsChatoverview(false)}}>DEMOGORGAN</p>
            </div>
            <div className="header-menu">
            <IconBtn
                title={"Menu"}
                icon={<MenuIcon />}
                onClick={()=> setIsMobileChat(!isMobileChat)}
              />
            </div>

            <div className='header-middle'>

                {
                chatDetails.groupChat ?
                ( 
                    <div className='chat-user-info-container' >
                        <p>{chatDetails.name}</p>
                    </div>
                ) :

                ( 
                  userInfo === null || isChatDetailsLoading ?
                  <CommonLoader/>
                  :
                  (
                  <div className="chat-user-info-container">
                    <div className="chat-user-info-image">
                      <img src={transformImage(userInfo?.avatar)} alt="" />
                    </div>
                    <div className="chat-user-info-data" onClick={()=> setIsChatoverview((prev)=> !prev)}>
                        <p className="chat-user-name">{userInfo.name}</p>
                        <p className="chat-user-last-active">{moment(userInfo.lastActive).format("h:mm:ss a, DD/MM/YY")} </p>
                    </div>
                  </div>  
                  )
                )
                }                
            </div>


            <div className="chat-header-icons">
                <img src={logo} alt="logo" className="header-image" onClick={()=> { location.pathname !== "/" && navigate('/'); setIsChatoverview(false) }} />
            </div>
        </div>
    );
};

export default ChatHeader;