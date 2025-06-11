
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AudioList = () => {
  const [audios, setAudios] = useState([]);

  const fetchAudios = async () => {
    const res = await axios.get('https://audiobackend.onrender.com');
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
          <audio controls src={`http://localhost:5000/${audio.filePath}`} />
        </div>
      ))}
    </div>
  );
};

export default AudioList;
