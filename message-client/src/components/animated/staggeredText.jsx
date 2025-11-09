import {motion} from"framer-motion"

const StaggeredText =({children , font='2.3rem'})=>{
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
            opacity: .5,
          },
          visible: {
            x:0,
            color:['#000000', '#93c663', '#6faf6e' , '#c2f09d'],
            opacity: 1,
            transition: {
              duration: 4,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: "easeInOut"
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
                    variants={childrenVariants}
                    whileHover={{ color:'#93c663', margin:'6px', rotate:'7deg' , scale:1.2 }}
                    whileTap={{color:'#93c663', margin:'3px', rotate:'-7deg' , scale:1.1 }}

                    key={i}
                    style={{
                        fontSize:font,

                    }}
                    className='welcome-text'>
                        {l}
                    </motion.span>
                ))
            }
        </motion.div>
    )

}

export default StaggeredText;