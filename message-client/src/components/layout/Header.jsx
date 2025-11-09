import React, { Suspense, lazy } from 'react';
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
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

 const { notificationCount , setNotificationCount , isMobileChat , setIsMobileChat  ,  isNewGroup , setIsNewGroup , isSearch , setIsSearch , isMobile , setIsMobie ,isNotification , setIsNotification}= useMyContext()
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
              <p style={{fontWeight:"700"}} onClick={()=> {location.pathname !== "/" && navigate('/')}}>DEMOGORGAN</p>
            </div>
            <div className="header-menu">
            <IconBtn
                title={"Menu"}
                icon={<MenuIcon />}
                onClick={()=> setIsMobileChat(!isMobileChat)}
              />
            </div>
            <div style={{flexGrow:"1"}}></div>
            <div className="header-icons">
            <IconBtn
                title={"Search"}
                icon={<SearchIcon />}
                onClick={()=>setIsSearch(prev => !prev)}
 
              />

              <IconBtn
                title={"New Group"}
                icon={<AddIcon />}
                onClick={()=>setIsNewGroup(prev => !prev)}

              />

              <IconBtn
                title={"Manage Groups"}
                icon={<GroupIcon />}
                onClick={()=> navigate('/groups')}

              />

              <IconBtn
                title={"Notifications"}
                icon={<NotificationsIcon />}
                value={notificationCount}
                onClick={()=>{
                   setIsNotification(prev => !prev);
                   setNotificationCount(0);
                  }}

              />

              <IconBtn
                title={"Logout"}
                icon={<LogoutIcon />}
                onClick={logoutHandler}

              />
            </div>

            {
                isSearch && 
                <Suspense fallback={<Backdrop sx={{zIndex:'999'}} open/>}>
                    <SearchDialog />
                </Suspense>
            }
            {
                isNewGroup && 
                <Suspense fallback={<Backdrop  sx={{zIndex:'999'}} open/>}>
                    <NewGroupDialog />
                </Suspense>
            }
            {
                isNotification && 
                <Suspense fallback={<Backdrop  sx={{zIndex:'999'}} open/>}>
                    <NotificationsDialog />
                </Suspense>
            }
        </div>
    );
};

export default Header;