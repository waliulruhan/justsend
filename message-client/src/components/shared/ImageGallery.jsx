import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./shared.css";
import { CloseFullscreen, ArrowCircleDown} from '@mui/icons-material';
import { IconButton } from "@mui/material";
import { transformImage } from "../../lib/features";



const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [index, setIndex] = useState(0);

  const openImage = (idx) => {
    setIndex(idx);
    setSelectedImage(images[idx]);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    setIndex((prev) => (prev + 1) % images.length);
    setSelectedImage(images[(index + 1) % images.length]);
  };

  const prevImage = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
    setSelectedImage(images[(index - 1 + images.length) % images.length]);
  };

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;

    const date = new Date();
    link.download = "download_${date.toISOString()}.jpg";
    link.target = "_blank";

    link.click(); 
    console.log(url)
  };

  if(!images){
    return <p className="">No Images Found.</p>
  }

  return (
    <div className="gallery-container">
      {/* Grid Layout */}
      <div className="gallery-grid">
        {images.map((img, idx) => (
          <motion.img
            key={idx}
            src={transformImage(img, 200)}
            alt={`Image ${idx}`}
            className="gallery-image"
            whileHover={{ scale: 1.02, borderRadius: 0 }}
            onClick={() => openImage(idx)}
          />
        ))}
      </div>

      {/* Full-Screen Viewer */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImage}
          >
            <motion.div className="selected-image-header">
                <IconButton onClick={closeImage} >
                  <CloseFullscreen/>
                </IconButton>
                <IconButton onClick={(e)=> {e.stopPropagation(); handleDownload(selectedImage)}} >
                  <ArrowCircleDown/>
                </IconButton>
            </motion.div>
            <motion.img
              key={selectedImage}
              src={selectedImage}
              alt="Selected"
              className="full-image"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            />
            {/* Navigation */}
            <button className="prev-btn" onClick={(e) => { e.stopPropagation(); prevImage(); }}>&#10094;</button>
            <button className="next-btn" onClick={(e) => { e.stopPropagation(); nextImage(); }}>&#10095;</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageGallery;
