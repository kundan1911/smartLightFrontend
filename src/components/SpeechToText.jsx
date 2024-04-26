import React, { useState } from 'react';
import './SpeechtoText.css';
import axios from 'axios'
import micIcon from '../assets/mic.png';
const SpeechToText = (props) => {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  let recognition;

  const startSpeechRecognition = () => {
    setIsListening(true);
    recognition = new webkitSpeechRecognition(); // For Chrome, use webkitSpeechRecognition
    recognition.lang = 'en-US'; // Set language
    recognition.start(); // Start listening

    recognition.onresult = (event) => {
  const speechToText = event.results[0][0].transcript;
      setRecognizedText(speechToText);
      console.log('Speech to text:', speechToText);
      sendRequestToBackend(speechToText);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
  };

  const stopSpeechRecognition = () => {
    recognition.stop();
    setIsListening(false);
  };

  const sendRequestToBackend = (text) => {
    // Replace this fetch call with your actual backend endpoint
    axios
    .post("http://localhost:5002/voiceControl", {
      text: text,
      roomId: props.roomId,
      userEmail: props.userEmail,
    })
    .then((response) => {
      console.log(response.data); // Assuming the server sends back a success message
      props.gettheIndex(response.data?.reqobj?.index,response.data?.reqobj?.state)
    })
    .catch((error) => {
      console.error(error);
    });
  };

  return (
    <div className="speech-to-text-container">
      <div className={`speech-button ${isListening ? 'listening' : ''}`} onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}>
        <img src={micIcon} alt="microphone" className="mic-icon" />
      </div>
      {isListening && (
        <div className="listening-indicator"></div>
      )}
      {recognizedText && (
        <div className="recognized-text-box">
          <p>{recognizedText}</p>
        </div>
      )}
    </div>
  );
};

export default SpeechToText;
