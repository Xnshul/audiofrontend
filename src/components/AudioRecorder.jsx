import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const MAX_DURATION = 30;

const AudioRecorder = ({ onUploadSuccess }) => {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [title, setTitle] = useState('');
  const [timeLeft, setTimeLeft] = useState(MAX_DURATION);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [blob, setBlob] = useState(null);
  const chunks = useRef([]);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let rafId;
    const draw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const analyser = analyserRef.current;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let x = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i];
        ctx.fillStyle = `hsl(${i % 360}, 100%, 60%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      rafId = requestAnimationFrame(draw);
    };

    if (recording && analyserRef.current) {
      draw();
    }

    return () => cancelAnimationFrame(rafId);
  }, [recording]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    chunks.current = [];

    recorder.ondataavailable = (e) => chunks.current.push(e.data);

    recorder.onstop = () => {
      const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
      setBlob(audioBlob); // Save for manual submit
    };

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    analyserRef.current = analyser;
    source.connect(analyser);

    recorder.start();
    setRecording(true);
    setTimeLeft(MAX_DURATION);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setRecording(false);
    setPaused(false);
    clearInterval(timerRef.current);
  };

  const pauseRecording = () => {
    if (mediaRecorder?.state === 'recording') {
      mediaRecorder.pause();
      setPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder?.state === 'paused') {
      mediaRecorder.resume();
      setPaused(false);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setBlob(null);
    setTimeLeft(MAX_DURATION);
    setTitle('');
  };

  const handleUpload = async () => {
    if (!blob || !title) return;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('audio', blob, 'recording.webm');

    await axios.post('https://audiobackend.onrender.com', formData);
    setBlob(null);
    setTitle('');
    setTimeLeft(MAX_DURATION);
    onUploadSuccess?.();
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-xl max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">🎤 Audio Recorder</h2>

      <input
        className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:text-white"
        placeholder="Enter a title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={recording}
      />

      <canvas ref={canvasRef} width={300} height={80} className="w-full rounded bg-gray-100 dark:bg-gray-700" />

      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
        <div
          className="bg-blue-500 h-2.5 rounded-full"
          style={{ width: `${((MAX_DURATION - timeLeft) / MAX_DURATION) * 100}%` }}
        ></div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {!recording && !blob && (
          <button
            onClick={startRecording}
            disabled={!title}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Start
          </button>
        )}
        {recording && !paused && (
          <>
            <button
              onClick={pauseRecording}
              className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500"
            >
              Pause
            </button>
            <button
              onClick={stopRecording}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Stop
            </button>
          </>
        )}
        {recording && paused && (
          <>
            <button
              onClick={resumeRecording}
              className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500"
            >
              Resume
            </button>
            <button
              onClick={stopRecording}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Stop
            </button>
          </>
        )}
        {(recording || blob) && (
          <button
            onClick={cancelRecording}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cancel
          </button>
        )}
        {blob && (
          <button
            onClick={handleUpload}
            disabled={!title}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
