import './specific.css';
import { Button, IconButton, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMyContext } from '../../utils/context';
import {motion, AnimatePresence} from "framer-motion"
import { Attachment, Close,  } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { server } from '../constants/config';
import moment from 'moment';
import AttachmentModal from '../shared/AttahmentModal';

const ChatOverview = ({
    chatId,
    chatDetails,
    isChatDetailsLoading
}) => {
    const { myData, setIsChatoverview } = useMyContext();
    console.log(chatDetails)
    
    const ChatOverviewVariants = {
        hidden: {
          y: 100,
          opacity: 0,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.1,
            type: 'spring',
            stiffness: 250,
            damping: 25
          },
        },
        exit: {
          opacity: 0.5,
          y: 100,
          transition: {
            duration: 0.1,
          },
        },
      };

    const [userInfo, setUserInfo] = useState(null);
    const [isAttachmentModal, setIsAttachmentModal] = useState(false);

    useEffect(() => {
      if (chatDetails && Array.isArray(chatDetails.members)) {
        const foundUser = chatDetails.members.find(i => i._id !== myData._id);
        setUserInfo(foundUser);
      }
    }, [chatDetails, myData]);
    
    const { data: chatOverviewData, isLoading: isChatOverviewLoading, error } = useQuery({
              queryKey: ['chat-overview-data', chatDetails?._id],
              queryFn: async () => {
                  if (chatDetails) {
                      try {
                          const { data } = await axios.post(
                              `${server}/api/v1/chat/chat-overview`,
                              { chatId: chatDetails._id },
                              { withCredentials: true }
                          );
                          console.log(data);
                          return data;
                      } catch (error) {
                          console.error("Error fetching chat overview data:", error);
                          throw new Error("Failed to fetch chat overview data");
                      }
                  }
              },
          });

    // useState(()=>{
    //   if(chatDetails._id){
    //     chat
    //   }
    // },[chatDetails]);

    return (
            <motion.div
            variants={ChatOverviewVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"

            className='chat-overview-container'  
            >

                <AnimatePresence>
                    {isAttachmentModal && <AttachmentModal chatId={chatId}  setIsAttachmentModal={setIsAttachmentModal} />}
                </AnimatePresence>

               <div className="chat-overview-header">
                 <IconButton onClick={()=> setIsChatoverview(false) }>
                    <Close /> 
                 </IconButton>
               </div>
               <div className="chat-overview-main">
                    {

                      isChatDetailsLoading || userInfo == null 
                      ?

                      'loading.....'
                      :

                      <div className="chat-overview-1">
                        <div className="chat-overview-photo">
                            <img src={userInfo.avatar} alt='img' />
                        </div>
                        <div className="chat-overview-name">
                            <p>{userInfo.name}</p>
                        </div>
                    </div>
                    }
                    
                    <div className="chat-overview-2">
                        <div className="chat-overview-item">
                          <Button onClick={()=> setIsAttachmentModal(true)} variant='text'  sx={{color: 'black', display:'flex', gap:'10px', width: '100%', justifyContent:"start"}} >
                            <Attachment/>
                            <p>Attachments</p>
                          </Button>
                        </div>
                    </div>
               </div>
               <div className="chat-overview-footer">
                
                  {isChatOverviewLoading ? (
                        <p>Loading..</p>
                    ) : error ? (
                        <p>Error fetching chat overview data.</p>
                    ) : (
                        <>
                            <p>Messages: <br /> {chatOverviewData?.messagesCount}</p>
                        </>
                  )}

                  <p>Created On: <br /> {moment(chatDetails.createdAt).format("h:mm:ss a, DD/MM/YY")}</p>
               </div>
            </motion.div>
    );
};

export default ChatOverview;