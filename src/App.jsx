import React, { useState } from "react";
import AudioRecorder from "./components/AudioRecorder";
import AudioList from "./components/AudioList";



function App() {
  const [refresh, setRefresh] = useState(false);
 const fetchAudioListAgain = () => {
    setRefresh(prev => !prev);
  };
 

  return (
    <div>
    
      <AudioRecorder onUploadSuccess={fetchAudioListAgain} />
      <div className="list"><AudioList refresh={refresh} /> </div>
    </div>
  );
}

export default App;
