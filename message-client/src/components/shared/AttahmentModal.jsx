import './shared.css';
import { Button, IconButton, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMyContext } from '../../utils/context';
import {motion} from "framer-motion"
import { ArrowBack, Attachment, Close, CropSquareSharp } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { server } from '../constants/config';
import moment from 'moment';
import TabComponent from './TabComponent';
import { CommonLoader } from '../layout/Loaders';

const AttachmentModal = ({
    chatId,
    setIsAttachmentModal
}) => {
    const { myData, setIsChatoverview } = useMyContext();
    
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

    
    const { data: attachmentData, isLoading: isAttachhmentDataLoading, error } = useQuery({
              queryKey: ['attachment-data', chatId],
              queryFn: async () => {
                  if (chatId) {
                      try {
                          const { data } = await axios.post(
                              `${server}/api/v1/chat/attachment`,
                              { chatId },
                              { withCredentials: true }
                          );
                          console.log(data);
                          return data;
                      } catch (error) {
                          console.error("Error fetching attachment", error);
                          throw new Error("Failed to fetch attachment");
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

            className='attachment-modal-container'  
            >
               <div className="attachment-modal-header">
                 <IconButton onClick={()=> setIsAttachmentModal(false) }>
                    <ArrowBack /> 
                 </IconButton>
               </div>
              {
                isAttachhmentDataLoading
                
                ?

                <CommonLoader/>

                :

                <TabComponent attachments={ attachmentData.attachments } />
              }
               
            </motion.div>
    );
};

export default AttachmentModal;