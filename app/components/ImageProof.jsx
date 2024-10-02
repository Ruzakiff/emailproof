import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TitleBar } from "@shopify/app-bridge-react";
import { NoteIcon } from '@shopify/polaris-icons';
import Draggable from 'react-draggable';

const baseUrl = 'https://ryanchenyang.com';

// Custom hook for managing image processing
function useImageProcessing(apiKey) {
  const [processedImages, setProcessedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const processImage = useCallback(async (file) => {
    if (!apiKey) {
      setError('API key is missing');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      // Check root URL first
      console.log('Checking root URL:', baseUrl); // Debug log
      const rootResponse = await fetch(baseUrl, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
        },
      });

      console.log('Root URL response status:', rootResponse.status); // Debug log

      if (!rootResponse.ok) {
        throw new Error(`Root URL check failed: ${rootResponse.status} ${rootResponse.statusText}`);
      }

      const rootData = await rootResponse.json();
      console.log('Root URL response data:', rootData); // Debug log

      // Proceed with image processing
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading image to:', `${baseUrl}/remove-background`); // Debug log
      const response = await fetch(`${baseUrl}/remove-background`, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      console.log('Upload response:', data); // Debug log
      const taskId = data.task_id;

      // Poll for task status
      let status;
      do {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between polls
        console.log('Checking task status...'); // Debug log
        const statusResponse = await fetch(`${baseUrl}/task-status/${taskId}`, {
          headers: {
            'X-API-Key': apiKey,
          },
        });
        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          throw new Error(`Status check failed: ${statusResponse.status} ${statusResponse.statusText}. ${errorText}`);
        }
        const statusData = await statusResponse.json();
        console.log('Status response:', statusData); // Debug log
        status = statusData.status;
      } while (status === 'processing');

      if (status !== 'completed') {
        throw new Error(`Processing failed: ${status}`);
      }

      // Get the result
      console.log('Fetching result...'); // Debug log
      const resultResponse = await fetch(`${baseUrl}/get-result/${taskId}`, {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      if (!resultResponse.ok) {
        const errorText = await resultResponse.text();
        throw new Error(`Failed to retrieve result: ${resultResponse.status} ${resultResponse.statusText}. ${errorText}`);
      }

      const blob = await resultResponse.blob();
      const url = URL.createObjectURL(blob);

      setProcessedImages(prev => [...prev, { id: taskId, url, name: file.name }]);
    } catch (err) {
      console.error('Error in processImage:', err); // Debug log
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey]);

  return { processedImages, isProcessing, error, processImage };
}

export function ImageProof(props) {
  console.log('ImageProof props:', props);

  const { Page, DropZone, LegacyStack, Thumbnail, Text, Button, Select } = props;

  const [files, setFiles] = useState([]);
  const [mediaType, setMediaType] = useState('tshirt');
  const [error, setError] = useState(null);
  const apiKey = '2ef77a2e55864bb5cdb3f0239731c647fc8d8e36d65c5d88be5f75ebfb5fec5d';

  console.log('API Key:', apiKey);

  const { processedImages, isProcessing, processImage } = useImageProcessing(apiKey);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState(null);

  const mediaOptions = [
    {label: 'T-Shirt', value: 'tshirt'},
    {label: 'Mug', value: 'mug'},
    {label: 'Poster', value: 'poster'},
  ];

  const backgroundImages = {
    tshirt: 'materials/rawred_u2netp_alpha.png',
    mug: 'materials/redtshirt.jpg',
    poster: '/poster-template.jpg',
  };

  const tshirtBounds = {
    left: '20%',
    top: '25%',
    width: '60%',
    height: '50%'
  };

  const loadBackgroundImage = useCallback((mediaType) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        setCanvasSize({ width: img.width, height: img.height });
        resolve(img);
      };
      img.src = backgroundImages[mediaType];
    });
  }, [backgroundImages]);

  useEffect(() => {
    loadBackgroundImage(mediaType);
  }, [mediaType, loadBackgroundImage]);

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) =>
      setFiles((files) => [...files, ...acceptedFiles]),
    [],
  );

  const handleMediaTypeChange = useCallback((value) => setMediaType(value), []);

  const handleUpload = useCallback(async () => {
    for (const file of files) {
      await processImage(file);
    }
    setFiles([]);
  }, [files, processImage]);

  const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

  const fileUpload = !files.length && (
    <DropZone.FileUpload actionHint="Accepts .gif, .jpg, and .png" />
  );

  const uploadedFiles = files.length > 0 && (
    <LegacyStack vertical>
      {files.map((file, index) => (
        <LegacyStack alignment="center" key={index}>
          <Thumbnail
            size="small"
            alt={file.name}
            source={
              validImageTypes.includes(file.type)
                ? window.URL.createObjectURL(file)
                : NoteIcon
            }
          />
          <div>
            {file.name}{' '}
            <Text variant="bodySm" as="p">
              {file.size} bytes
            </Text>
          </div>
        </LegacyStack>
      ))}
    </LegacyStack>
  );

  const [imageSizes, setImageSizes] = useState({});
  const [imagePositions, setImagePositions] = useState({});

  const handleResize = useCallback((imageId, direction) => {
    setImageSizes(prev => {
      const currentSize = prev[imageId] || { scale: 1 };
      const newScale = direction === 'increase' 
        ? Math.min(currentSize.scale * 1.1, 2) 
        : Math.max(currentSize.scale * 0.9, 0.5);
      return { ...prev, [imageId]: { scale: newScale } };
    });
  }, []);

  const handleDragStop = (imageId, e, data) => {
    setImagePositions(prev => ({
      ...prev,
      [imageId]: { x: data.x, y: data.y }
    }));
  };

  const overlayedImages = processedImages.length > 0 && (
    <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <img 
        src={backgroundImages[mediaType]} 
        alt={`${mediaType} template`} 
        style={{ width: '100%', pointerEvents: 'none' }} 
      />
      <div style={{
        position: 'absolute',
        left: tshirtBounds.left,
        top: tshirtBounds.top,
        width: tshirtBounds.width,
        height: tshirtBounds.height,
      }}>
        {processedImages.map((image) => (
          <React.Fragment key={image.id}>
            <Draggable 
              bounds="parent"
              defaultPosition={{x: 0, y: 0}}
              onStart={(e) => e.stopPropagation()}
              onDrag={(e) => e.stopPropagation()}
              onStop={(e, data) => handleDragStop(image.id, e, data)}
            >
              <div style={{ position: 'absolute', cursor: 'move' }}>
                <img
                  src={image.url}
                  alt={image.name}
                  style={{ 
                    width: '100px',
                    height: 'auto',
                    transform: `scale(${imageSizes[image.id]?.scale || 1})`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </Draggable>
            <div style={{
              position: 'absolute',
              left: '10px',
              bottom: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}>
              <button 
                onClick={() => handleResize(image.id, 'increase')}
                style={buttonStyle}
              >
                +
              </button>
              <button 
                onClick={() => handleResize(image.id, 'decrease')}
                style={buttonStyle}
              >
                -
              </button>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const captureOverlappedImage = useCallback(async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    const bgImage = await loadBackgroundImage(mediaType);
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Calculate t-shirt area bounds
    const tshirtArea = {
      x: canvas.width * parseFloat(tshirtBounds.left) / 100,
      y: canvas.height * parseFloat(tshirtBounds.top) / 100,
      width: canvas.width * parseFloat(tshirtBounds.width) / 100,
      height: canvas.height * parseFloat(tshirtBounds.height) / 100
    };

    processedImages.forEach((image) => {
      const img = new Image();
      img.onload = () => {
        const scale = imageSizes[image.id]?.scale || 1;
        const position = imagePositions[image.id] || { x: 0, y: 0 };

        const scaledWidth = 100 * scale;
        const scaledHeight = (img.height / img.width) * scaledWidth;

        const x = tshirtArea.x + position.x;
        const y = tshirtArea.y + position.y;

        ctx.save();
        ctx.translate(x, y);
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
        ctx.restore();

        // Set the captured image URL after all images are drawn
        if (image === processedImages[processedImages.length - 1]) {
          const dataUrl = canvas.toDataURL('image/png');
          setCapturedImageUrl(dataUrl);
        }
      };
      img.src = image.url;
    });
  }, [canvasSize, mediaType, processedImages, imageSizes, imagePositions, loadBackgroundImage]);

  useEffect(() => {
    const checkRootUrl = async () => {
      try {
        const response = await fetch(baseUrl, {
          method: 'GET',
          headers: {
            'X-API-Key': apiKey,
          },
        });
        
        if (response.ok) {
          setError(null);
        } else {
          setError(`Failed to connect to server: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        setError(`Network error: ${error.message}`);
      }
    };

    checkRootUrl();
  }, [apiKey]);

  return (
    <Page>
      <TitleBar title="Image Proof" />
      <Select
        label="Select Media Type"
        options={mediaOptions}
        onChange={handleMediaTypeChange}
        value={mediaType}
      />
      {error && <Text variation="negative">{error}</Text>}
      {processedImages.length === 0 ? (
        <>
          <DropZone onDrop={handleDropZoneDrop} variableHeight>
            {uploadedFiles}
            {fileUpload}
          </DropZone>
          {files.length > 0 && (
            <Button onClick={handleUpload} primary loading={isProcessing}>
              {isProcessing ? 'Processing...' : 'Process Images'}
            </Button>
          )}
        </>
      ) : (
        <>
          <Text variant="bodyMd">Images processed successfully! Drag them around:</Text>
          {overlayedImages}
        </>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <Button onClick={captureOverlappedImage}>Capture Image</Button>
      {capturedImageUrl && (
        <div style={{ marginTop: '20px' }}>
          <h2>Captured Image:</h2>
          <img 
            src={capturedImageUrl} 
            alt="Captured design" 
            style={{ maxWidth: '100%', border: '1px solid #ccc' }} 
          />
        </div>
      )}
    </Page>
  );
}

const buttonStyle = {
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  fontSize: '24px',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 1)',
  },
};
