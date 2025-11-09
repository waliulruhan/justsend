import moment from 'moment';
import React, { memo } from 'react';
import './shared.css'
import { Box } from '@mui/material';
import { fileFormat, transformImage } from '../../lib/features';
import RenderAttachment from './RenderAttachment';
import { MessageItemEasterEgg } from '../../lib/esaterEgg';
import { DoneAll } from '@mui/icons-material';
import {motion} from'framer-motion'
import Reveal from '../animated/Reveal';

const MessageItem = ({ message, user, chatDetails, sameSenderAsPrevious }) => {
    const { sender, content, attachments = [], createdAt , seen } = message;
    const sameSender = sender?._id === user?._id;
    const timeAgo = moment(createdAt).format('Do MMM YYYY, h:mm:ss a');
    const makeLinksClickable = (text) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="chat-link" >$1</a>');
    };

    const sanitizedContent = makeLinksClickable(content);

  
    return (
        <Reveal sameSender={sameSender} >
            <motion.div
                onDoubleClick={()=> MessageItemEasterEgg(content)}
                className='messageItem'
                style={{                    
                    backgroundColor: sameSender ? '#e1f0e1' : "#1f5f7aff",
                    color: "black",
                    borderRadius: sameSender ? "10px 10px 0px 10px" : (sameSenderAsPrevious ? "10px" : "0px 10px 10px 10px") ,
                    padding: "1px 8px",
                    width: "fit-content",
                    position: 'relative',
                    margin: !sameSenderAsPrevious ? (sameSender ? "13px 0px 0px 0px" : "13px 0px 0px 10px" ) : (sameSender ? "2px 0 0 0" : "2px 0px 0px 10px" )  ,
                }}
            >
                {
                    !sameSender 
                    &&
                    !sameSenderAsPrevious
                    &&
                    <div className="message-avatar">
                        <img src={transformImage(sender.avatar.url, 50)} alt="img" />
                    </div> 
                }
                {
                    !sameSender && chatDetails.groupChat && <p className='message-sender' >{sender.name}</p>
                }

                {
                    content && <p className='message-content' dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                }
                {attachments.length > 0 &&
                    attachments.map((attachment, index) => {
                        const url = attachment.url;
                        const file = fileFormat(url);

                        return (
                            <Box key={index}>
                                <a
                                    href={url}
                                    target="_blank"
                                    download
                                    style={{
                                        color: "black",
                                    }}
                                >
                                    <RenderAttachment file={file} url={url}/>
                                </a>
                            </Box>
                        );
                    })}
                {
                    sameSender? 
                    <p className="time-stamp">{timeAgo} <DoneAll sx={{fontSize:'15px' , color: seen ? "#22223b" : "" }}/> </p>   
                    :
                    <p className="time-stamp">{timeAgo}</p>   
                }

            </motion.div>
        </Reveal>
    );
};

export default memo(MessageItem);