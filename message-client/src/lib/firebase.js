// Import the functions you need from the SDKs you need
import React, { useEffect } from 'react';
import axios from 'axios';

import { getMessaging, getToken } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyCclXkbkbJzZkDu4GhOwGK2IaYiuvArlBQ",
  authDomain: "happiness-v1.firebaseapp.com",
  projectId: "happiness-v1",
  storageBucket: "happiness-v1.appspot.com",
  messagingSenderId: "875580832845",
  appId: "1:875580832845:web:7eea739f34613a2ca0f004",
  measurementId: "G-ECBZ9XT2LY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


//for notification
const messaging = getMessaging(app);

const NotificationSetup = () => {
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
          console.log('FCM Token:', token);
          // Send the token to your server to save it
          await axios.post('/api/save-token', { token });
        } else {
          console.log('Notification permission denied.');
        }
      } catch (error) {
        console.error('Error getting permission:', error);
      }
    };

    requestPermission();
  }, []);

  return null;
};

export default NotificationSetup;