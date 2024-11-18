import React, { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { toast } from 'react-toastify';
import { useUploadInputThumbnailMutation } from "../../../../services/casestudies";

const VALID_TYPES = [
  'image/jpeg',
  'image/png',
]

export default function ThumbnailUpload({ id, inputId }) {
  const [key, setKey] = useState(0);
  const [file, setFile] = useState(null);
  const [upload, { isLoading }] = useUploadInputThumbnailMutation();

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();

		formData.append('file', file);

    const res = await upload({ formData, id, inputId });
    if (res.data) {
      setKey(key + 1);
    }
    if (res.error) {
      toast.error('An error occurred');
    }
    console.log(res);
  }

  console.log(file);

  return (
    <div className="mb-2">
      <Form noValidate onSubmit={handleSubmit}>
        <Form.Label>
          Select a Thumbnail to upload
          <Form.Control key={key} type="file" onChange={handleFileChange} />
        </Form.Label>
        {(file && !VALID_TYPES.includes(file.type)) && (
          <Alert variant="warning" transition={null}>
            Unsupported file type, please upload a jpeg or a png image
          </Alert>
        )}
        <div className="mt-1">
          <Button type="submit" size="lg" disabled={!file || isLoading || (file && !VALID_TYPES.includes(file.type))}>
            Upload
          </Button>
        </div>
      </Form>
    </div>
  );
}
