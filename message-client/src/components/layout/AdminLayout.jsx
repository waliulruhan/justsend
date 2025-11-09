import styled from '@emotion/styled';
import { Close, Dashboard, ExitToApp, Groups, ManageAccounts, Menu, Message } from '@mui/icons-material';
import { Box, Drawer, IconButton, Stack } from '@mui/material';
import React, { useState } from 'react';
import { Link as LinkComponent, Navigate, useLocation, useNavigate } from "react-router-dom";
import './layout.css'
import { useMyContext } from '../../utils/context';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { server } from '../constants/config';
import { notifySuccess } from '../../lib/Toasting';

const AdminLayout = ({ children }) => {
    const [isMobile, setIsMobile] =useState(false) 
    const {isAdmin , setIsAdmin} =useMyContext();
    if(!isAdmin) return <Navigate to='/admin'/>

    return (
        <div className=''>
              <Stack
                width={'100vw'}
                direction={'row'}
                sx={{
                  display: {
                    xs: "block",
                    sm: "none",
                    height: "40px",
                  },
                }}
              >
                <IconButton 
                  onClick={()=>setIsMobile(!isMobile)}
                  sx={{
                    position:'absolute',
                    right:'5px'
                  }}
                >
                  {isMobile ? <Close/> : <Menu />}
                </IconButton>
              </Stack>

            <div className="admin-layout ">
                    <div className="admin-layout-side">
                            <Sidebar/>
                    </div>
                    <div className="admin-layout-main">
                        {children}
                    </div>
                    <Drawer open={isMobile} onClose={()=>setIsMobile(false)}>
                      <Sidebar w="50vw" />
                    </Drawer>
                </div>
        </div>
    );
};

const adminTabs = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <Dashboard />,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <ManageAccounts />,
    },
    {
      name: "Chats",
      path: "/admin/chats",
      icon: <Groups />,
    },
    {
      name: "Messages",
      path: "/admin/messages",
      icon: <Message />,
    },
  ];
  const Link = styled(LinkComponent)`
  text-decoration: none;
  border-radius: 0.3rem;
  padding: 1rem .5rem;
  color: black;
  &:hover {
    color: rgba(0, 0, 0, 0.54);
  }
  &.active {
    background-color: #c8d2bb;
    color: white;
  }
`;

const Sidebar = ({ w = "100%" }) => {
    const location = useLocation();
    const navigate = useNavigate()
    const {isAdmin , setIsAdmin} =useMyContext();

    const [loading, setLoading] = useState(false);

 
    const handleAdminLogout = async (e) => {
        e.preventDefault();
            const toastId = toast.loading("Logging out...");
 
            try {
                const { data } = await axios.get(
                    `${server}/api/v1/admin/logout`,
                    { withCredentials: true }
                );
 
                notifySuccess(data.message, { id: toastId });
 
                setIsAdmin(false);
                navigate('/admin');
 
            } catch (error) {
              notifyError(error?.response?.data?.message || "Something went wrong", { id: toastId });
            } finally {
                setLoading(false);
            }
        } 
    
  
    return (
      <Stack width={w} height={'100%'} direction={"column"} p={".5rem"} spacing={"0rem"}  bgcolor='#f7fdf0'  >
        <p>admin</p>
  
        <Stack spacing={"1rem"}>
          {adminTabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={location.pathname === tab.path ? 'active' : ''}
            >
              <Stack direction={"row"} alignItems={"center"} spacing={".5rem"}>
                {tab.icon}
                <p>{tab.name}</p>
              </Stack>
            </Link>
          ))}
  
          <Link >
            <Stack onClick={handleAdminLogout}  direction={"row"} alignItems={"center"} spacing={"1rem"}>
              <ExitToApp />
  
              <p>Log out</p>
            </Stack>
          </Link>
        </Stack>
      </Stack>
    );
  };
  


export default AdminLayout;