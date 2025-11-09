import React, { useEffect, useRef } from 'react';
import {motion, useAnimation, useInView} from'framer-motion'



const Reveal = ({children , sameSender}) => {
    const variants ={
        hidden: {
            x: sameSender ? 60 : -60,
            opacity: 0,
        },
        visible: {
            x:0,  
            opacity:1,
        },
    };
    const ref = useRef(null);
    const isInView = useInView(ref , {once:"true"})

    useEffect(()=>{
        if(isInView){
            animationControlls.start('visible')
        }
    },[isInView])

    const animationControlls = useAnimation()
    return (
        <div ref={ref}
        
        style={{
            boxSizing: 'border-box',
            minWidth:'100%',
            display:'flex',
            flexDirection:"column",
        }}
        >
            <motion.div
                variants={variants}
                initial='hidden'
                animate={animationControlls}
                transition={{ duration: 0.35 }}

                style={{
                    alignSelf: sameSender ? "flex-end" : "flex-start",
                    boxSizing: 'border-box',
                    minWidth:'10%',
                    maxWidth: "95%",
                    display:'flex',
                }}

            >
                {children}
            </motion.div>
        </div>
    );
};

export default Reveal;