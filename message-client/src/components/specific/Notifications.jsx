import { Dialog, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMyContext } from '../../utils/context';
import { sampleNotifications } from '../constants/sampleData';
import NotificationItem from '../shared/NotificationItem';
import './specific.css';
import { server } from '../constants/config';
import axios from 'axios';
import { notifyError } from '../../lib/Toasting';
import { useQuery } from '@tanstack/react-query';
import { CommonLoader } from '../layout/Loaders';


const Notifications = () => {
    const {isNotification , setIsNotification}= useMyContext()
    const acceptRequestHandler = async({_id , accept})=>{
        try {
            const {data} = await axios.put(`${server}/api/v1/user/accept-request` , {requestId: _id , accept: accept} , {withCredentials: true});
          } catch (error) {
            notifyError(error.response.data.message || "Something went wrong")
          } finally{
            getNotificationhHandler()
          } 
    };
    
      const { data : notifications ,refetch , isLoading} = useQuery({
        queryKey: ['notifications'],
        queryFn: async ()=> {
            try {
              const {data} = await axios.get(`${server}/api/v1/user/notifications` , {withCredentials: true});

              return data.allRequests

            } catch (error) {
                notifyError(error.response.data.message || "Something went wrong")
            }    
        }
    } ); 

    console.log(isLoading , notifications)

    const dialogStyle = {
        maxHeight: "100dvh",
        maxWidth: '100vw',
        };
    return (
    <Dialog 
        PaperProps={{ sx: dialogStyle }} 
         open={isNotification}
         onClose={()=> setIsNotification(false)}
        >
            <Stack   bgcolor='#eff9e8' textAlign={'center'} justifyContent={'start'} alignItems={'center'} p={'1rem'} width={'70vw'} direction={'column'}>
                <p className="dialog-header">Notifications</p>
                <div className="dialog-user-list">
                    {   isLoading ? <CommonLoader/> :
                        (notifications.length > 0 ? (
                            notifications.map(({sender , _id})=>{
                                return <NotificationItem sender={sender} _id={_id} key={_id} handler={acceptRequestHandler} />
                            })   
                        ) : (
                            <p>0 notifications</p>
                        ))
                    }
                </div>
            </Stack>
        </Dialog>
    );
};

export default Notifications;