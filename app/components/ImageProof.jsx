import React, { useState, useCallback } from 'react';
import { TitleBar } from "@shopify/app-bridge-react";
import { NoteIcon } from '@shopify/polaris-icons';

export function ImageProof({ Page, DropZone, LegacyStack, Thumbnail, Text }) {
  const [files, setFiles] = useState([]);

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) =>
      setFiles((files) => [...files, ...acceptedFiles]),
    [],
  );

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

  return (
    <Page>
      <TitleBar title="Image Proof" />
      <DropZone onDrop={handleDropZoneDrop} variableHeight>
        {uploadedFiles}
        {fileUpload}
      </DropZone>
    </Page>
  );
}