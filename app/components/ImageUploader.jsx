import React, { useState } from 'react';
import { Button, Stack, Thumbnail, Text } from '@shopify/polaris';

export function ImageUploader() {
  const [image, setImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Stack vertical>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
        id="image-upload"
      />
      <Button onClick={() => document.getElementById('image-upload').click()}>
        Upload Image
      </Button>
      {image && (
        <Stack vertical alignment="center">
          <Thumbnail source={image} alt="Uploaded image" size="large" />
          <Text variant="bodyMd">Image uploaded successfully!</Text>
        </Stack>
      )}
    </Stack>
  );
}