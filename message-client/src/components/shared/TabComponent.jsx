import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './shared.css';
import ImageGallery from './ImageGallery';

const TabComponent = ({attachments}) => {
  const [activeTab, setActiveTab] = useState(0);
  console.log(attachments)
  const tabs = [
    { id: 0, title: 'Image', content: <Image images={attachments.images}  /> },
    { id: 1, title: 'Audio', content: <Audio /> },
    { id: 2, title: 'Video', content: <Video /> },
    { id: 3, title: 'File', content: <File /> },
  ];

  return (
    <div className="tabs-container">
      {/* Tab Titles */}
      <div className="tab-titles">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(index)}
            className={`tab-button ${activeTab === index ? 'active' : ''}`}
          >
            <p>{tab.title}</p>
            
            {activeTab === index && (
              <motion.div
                layoutId="underline"
                className="underline"
                initial={{ height: 0 }}
                animate={{ height: "3px" }}
                transition={{type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
      
      {/* Tab Content with Unique Flip Animation */}
      <div className="tab-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 50 }}  // Start off-screen (right side)
            animate={{ opacity: 1, x: 0 }}  // Slide in to center
            exit={{ opacity: 0, x: -50 }}   // Slide out to left
            transition={{ duration: 0.1, ease: "easeInOut" }} // Smooth animation
            className="animated-content"
          >
            {tabs[activeTab].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Animated Content Components
const Image = ({images}) => (
  <>
   <ImageGallery images={images} />
  </>
);
const Audio = () => (
  <motion.div
    className="no-content"
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    No Audio
  </motion.div>
);
const Video = () => (
  <motion.div
    className="no-content"
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    No Video
  </motion.div>
);
const File = () => (
  <motion.div
    className="no-content"
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    No File
  </motion.div>
);

export default TabComponent;
