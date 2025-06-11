// frontend/src/components/AudioList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AudioList = () => {
  const [audios, setAudios] = useState([]);

  const fetchAudios = async () => {
    const res = await axios.get('http://localhost:5000/api/audio');
    setAudios(res.data);
  };

  useEffect(() => {
    fetchAudios();
  }, []);

  return (
    <div>
      <h2>Audio List</h2>
      {audios.map(audio => (
        <div key={audio._id}>
          <strong>{audio.title}</strong>
          <audio controls src={`https://audiobackend.onrender.com${audio.filePath}`} />
        </div>
      ))}
    </div>
  );
};

export default AudioList;


