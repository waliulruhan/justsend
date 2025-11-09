import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import {motion} from"framer-motion"

import StaggeredText from '../components/animated/staggeredText'
import { useMyContext } from '../utils/context';
import moment from 'moment';

const AnimatedText =({children , font='2.3rem'})=>{
    const mainVariants ={
        hidden: {
            opacity: 0,
            x:-30,
        },
        visible: {
            opacity: 1,
            x:0,
            transition: {
                delay: .5,
                when: "beforeChildren",
                staggerChildren: .05,
            },
        },
      };

      const childrenVariants = {
        hidden: {
            x:-10,
            opacity: 0,
          },
          visible: {
            x:[0,10, 0],
            color:['#000000', '#93c663' , '#000000'],  
            scale:[1 , 1.2, 1],  
            opacity: 1,
            transition: {
              duration: 1,
          },
          },
      };
    return(
        <motion.div
        variants={mainVariants}
        initial='hidden'
        animate="visible"
        >
            {
                children.split('').map((l, i)=>(
                    <motion.span 
                    drag
                    dragConstraints={{
                        top:-50,
                        bottom:50,
                        left:-50,
                        right: 50,

                    }}
                    // dragTransition={{bounceStiffness:600, bounceDamping: 20}}
                    // dragElastic
                    // dragDirectionLock
                    // dragMomentum={false}
                    dragSnapToOrigin
                    // dragListener
                    whileDrag={{scale:3}}

                    variants={childrenVariants}
                    whileHover={{ color:'#93c663',  rotate:'7deg' , scale:1.2 }}
                    whileTap={{color:'#93c663', margin:'6px', rotate:'-7deg' , scale:1.1 , cursor:"grabbing" }}

                    key={i}
                    style={{
                        fontSize:font,
                        cursor:'grab'
                    }}
                    className='welcome-text'>
                        {l}
                    </motion.span>
                ))
            }
        </motion.div>
    )

}

const Home = () => {
    const { myData } = useMyContext();
    const lastActiveTime = moment(myData.lastActive).format('h:mm:ss a');
    const lastActiveDate = moment(myData.lastActive).format('Do MMM YYYY');

    return (
        <div className='home-page'>
            <StaggeredText>Welcome to </StaggeredText>
            <StaggeredText font='3rem' >DEMOGORGAN</StaggeredText>
            <p></p>
            <AnimatedText font='1.3rem' >Select a friend to chat</AnimatedText>

            <div className="last-active-container">
                <p className="last-active"> {lastActiveTime}</p>
                <p className="last-active"> {lastActiveDate}</p>
            </div>

        </div>
    );
};



export default AppLayout()(Home);