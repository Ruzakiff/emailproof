import React, { useState, useCallback } from 'react';
import { TitleBar } from "@shopify/app-bridge-react";
import { NoteIcon } from '@shopify/polaris-icons';
import Draggable from 'react-draggable';

export function ImageProof({ Page, DropZone, LegacyStack, Thumbnail, Text, Button, Select } ) {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [processedImages, setProcessedImages] = useState([]);
  const [mediaType, setMediaType] = useState('tshirt');

  const mediaOptions = [
    {label: 'T-Shirt', value: 'tshirt'},
    {label: 'Mug', value: 'mug'},
    {label: 'Poster', value: 'poster'},
    // Add more media types as needed
  ];

  const backgroundImages = {
    tshirt: 'materials/rawred_u2netp_alpha.png',
    mug: 'materials/redtshirt.jpg',
    poster: '/poster-template.jpg',
    // Add more background images for each media type
  };

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) =>
      setFiles((files) => [...files, ...acceptedFiles]),
    [],
  );

  const handleMediaTypeChange = useCallback((value) => setMediaType(value), []);

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      // Simulating API call - replace with actual API call
      const uploadedImages = await Promise.all(files.map(async (file) => {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          id: Math.random().toString(36).substr(2, 9),
          url: URL.createObjectURL(file),
          name: file.name
        };
      }));

      setProcessedImages(uploadedImages);
    } catch (error) {
      console.error('Upload failed:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsUploading(false);
    }
  };

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

  const overlayedImages = processedImages.length > 0 && (
    <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <img src={backgroundImages[mediaType]} alt={`${mediaType} template`} style={{ width: '100%', pointerEvents: 'none' }} />
      {processedImages.map((image) => (
        <Draggable 
          key={image.id} 
          bounds="parent"
          onStart={(e) => e.stopPropagation()}
          onDrag={(e) => e.stopPropagation()}
          onStop={(e) => e.stopPropagation()}
        >
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              cursor: 'move',
              touchAction: 'none'
            }}
          >
            <img
              src={image.url}
              alt={image.name}
              style={{ maxWidth: '100px', maxHeight: '100px', pointerEvents: 'none' }}
            />
          </div>
        </Draggable>
      ))}
    </div>
  );

  return (
    <Page>
      <TitleBar title="Image Proof" />
      <Select
        label="Select Media Type"
        options={mediaOptions}
        onChange={handleMediaTypeChange}
        value={mediaType}
      />
      {processedImages.length === 0 ? (
        <>
          <DropZone onDrop={handleDropZoneDrop} variableHeight>
            {uploadedFiles}
            {fileUpload}
          </DropZone>
          {files.length > 0 && (
            <Button onClick={handleUpload} primary loading={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Images'}
            </Button>
          )}
        </>
      ) : (
        <>
          <Text variant="bodyMd">Images processed successfully! Drag them around:</Text>
          {overlayedImages}
        </>
      )}
    </Page>
  );
}