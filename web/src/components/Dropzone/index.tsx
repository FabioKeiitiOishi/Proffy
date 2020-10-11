import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import cameraIcon from '../../assets/images/icons/camera.svg';

import './styles';

interface Props {
  onFileUploaded: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({ onFileUploaded }) => {
  const [selectedFileUrl, setSelectedFileUrl] = useState('');

  const onDrop = useCallback(acceptedFile => {
    const file = acceptedFile[0];

    const fileUrl = URL.createObjectURL(file);

    setSelectedFileUrl(fileUrl);
    onFileUploaded(file);
  }, [onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*'
  });
  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} accept="image/*" />
        {
          selectedFileUrl
          ? <img src={selectedFileUrl} alt="Point Thumbnail" />
          : (
            <div>
              <p>
                Coloque sua imagem aqui ou clique aqui para selecionar a imagem
              </p>
              <div>
                <img src={cameraIcon} alt="Camera"/>
              </div>
            </div>
            
          )
        }
    </div>
  );
}

export default Dropzone;