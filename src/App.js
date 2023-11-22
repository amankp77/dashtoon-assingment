// src/App.js
import React, { useState } from 'react';
import './App.css';

const API_URL = "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud";
const API_KEY = "VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM";

function App() {
  const [comicText, setComicText] = useState(Array(10).fill(''));
  const [annotationPanelText, setAnnotationPanelText] = useState(Array(10).fill(''));
  const [comicImages, setComicImages] = useState(Array(10).fill(null));
  const [loading, setLoading] = useState(false);

  const handleInputChange = (index, value) => {
    const newText = [...comicText];
    newText[index] = value;
    setComicText(newText);
  };

  const handleAnnotationChange = (index, value) => {
    const newAnnotationText = [...annotationPanelText];
    newAnnotationText[index] = value;
    setAnnotationPanelText(newAnnotationText);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      
      const images = await Promise.all(
        comicText.map(async (text, index) => {
          if (!text) {
            return { imageUrl: null, annotation: "Write some text instead of generating an image." };
          }
          
          const data = { inputs: text };
          const response = await query(data);

          if (response.ok) {
            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            return { imageUrl, annotation: annotationPanelText[index] };
          } else {
            console.error(`Error for Panel ${index + 1}: ${response.statusText}`);
            return { imageUrl: null, annotation: `Error: ${response.statusText}` };
          }
        })
      );

      setComicImages(images);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnotherComic = () => {
    setComicText(Array(10).fill(''));
    setAnnotationPanelText(Array(10).fill(''));
    setComicImages(Array(10).fill(null));
  };

  const query = async (data) => {
    try {
      const response = await fetch(
        API_URL,
        {
          headers: {
            "Accept": "image/png",
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(data),
        }
      );
        
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Error in query function:', error.message);
      throw error;
    }
  };

  return (
    <div className="App">
    <div className="container">
      <div className="left">
      <header>
        <h1>Imagine Your Comics</h1>
      </header>
      <form onSubmit={(e) => e.preventDefault()}>
        {comicText.map((text, index) => (
          <div key={index} className="panel-inputs">
            <div className="panel-text">
              <label>{`Panel ${index + 1}: `}</label>
              <textarea
                className='textarea-name'
                value={text}
                onChange={(e) => handleInputChange(index, e.target.value)}
              />
            </div>
            <div className="annotation-text">
              <label>{`Speech bubbles ${index + 1}: `}</label>
              <textarea
                className='textarea-anot'
                value={annotationPanelText[index]}
                onChange={(e) => handleAnnotationChange(index, e.target.value)}
              />
            </div>
          </div>
        ))}

        <div className="buttons">

        <button type="button" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Generating...' : 'Make Comic'}
        </button>
        <button type="button" onClick={handleGenerateAnotherComic}>
          Make New Comic
        </button>
        </div>
      </form>
      </div>
      {/* {loading && <div className="loader"></div>} */}
      <div className="right">
      <div className="comic-display">
        {comicImages.map((panel, index) => (
          panel && (
            <div key={index} className="comic-panel">
              {panel.imageUrl ? (
                <img src={panel.imageUrl} alt={`Create more ${index + 1}`} />
              ) : (
                <div className="default-text">{panel.annotation}</div>
              )}
              {panel.annotation!=="Write some text instead of generating an image."?
              <div className="box box1">
              <div className="annotation">{panel.annotation}</div>
              </div>:
              <div></div>}
            </div>
          )
        ))}
      </div>
    </div>
    </div>
    </div>
  );
}

export default App;

