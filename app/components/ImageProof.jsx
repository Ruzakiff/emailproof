import React, { useState, useCallback } from 'react';
import { TitleBar } from "@shopify/app-bridge-react";
import { NoteIcon } from '@shopify/polaris-icons';
import Draggable from 'react-draggable';

export function ImageProof({ Page, DropZone, LegacyStack, Thumbnail, Text, Button }) {
  const [files, setFiles] = useState([]);
  const [isUploaded, setIsUploaded] = useState(false);

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) =>
      setFiles((files) => [...files, ...acceptedFiles]),
    [],
  );

  const handleUpload = () => {
    // TODO: Implement actual file upload logic here
    setIsUploaded(true);
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

  const overlayedImages = isUploaded && (
    <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <img src="/materials/rawred.jpg" alt="Red T-shirt" style={{ width: '100%' }} />
      {files.map((file, index) => (
        <Draggable key={index} bounds="parent">
          <div style={{ position: 'absolute', top: 0, left: 0, cursor: 'move' }}>
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              style={{ maxWidth: '100px', maxHeight: '100px' }}
            />
          </div>
        </Draggable>
      ))}
    </div>
  );

  return (
    <Page>
      <TitleBar title="Image Proof" />
      {!isUploaded ? (
        <>
          <DropZone onDrop={handleDropZoneDrop} variableHeight>
            {uploadedFiles}
            {fileUpload}
          </DropZone>
          {files.length > 0 && (
            <Button onClick={handleUpload} primary>
              Upload Images
            </Button>
          )}
        </>
      ) : (
        <>
          <Text variant="bodyMd">Images uploaded successfully! Drag them around:</Text>
          {overlayedImages}
        </>
      )}
    </Page>
  );
}