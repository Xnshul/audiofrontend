import React, { useState } from "react";
import AudioRecorder from './components/AudioRecorder';
import AudioList from './components/AudioList';

function App() {
  const [refresh, setRefresh] = useState(false);

  return (
    <div>
      <h1>Audio Recorder</h1>
      <AudioRecorder onUploadSuccess={() => setRefresh(!refresh)} />
      <AudioList key={refresh} />
    </div>
  );
}

export default App;