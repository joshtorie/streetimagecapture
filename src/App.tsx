import React, { useState, useEffect } from 'react';
import { Camera } from './components/Camera';
import { supabase } from './lib/supabase';
import { Upload } from 'lucide-react';

function App() {
  const [artistName, setArtistName] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<File | null>(null);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleImageCapture = (imageFile: File) => {
    setCapturedImage(imageFile);
  };

  const handleSubmit = async () => {
    if (!capturedImage || !location) return;

    setIsUploading(true);
    try {
      // Upload image to Supabase bucket
      const filename = `${Date.now()}-${capturedImage.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user_added_images')
        .upload(filename, capturedImage);

      if (uploadError) throw uploadError;

      // Get the public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('user_added_images')
        .getPublicUrl(filename);

      // Insert record into the database
      const { error: insertError } = await supabase
        .from('user_added_art')
        .insert([
          {
            user_id: null, // Set to null for anonymous uploads
            artist_name: artistName,
            longitude: location.longitude,
            latitude: location.latitude,
            image: publicUrl,
          },
        ]);

      if (insertError) throw insertError;

      // Reset form
      setArtistName('');
      setCapturedImage(null);
      alert('Art piece successfully uploaded!');
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Street Art Capture
        </h1>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="artistName" className="block text-sm font-medium text-gray-700">
              Artist Name
            </label>
            <input
              type="text"
              id="artistName"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter artist name if known"
            />
          </div>

          {location && (
            <div className="mb-4 text-sm text-gray-600">
              📍 Location detected: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </div>
          )}

          <Camera onCapture={handleImageCapture} />

          {capturedImage && (
            <div className="mt-4">
              <img
                src={URL.createObjectURL(capturedImage)}
                alt="Captured"
                className="w-full rounded-lg"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!capturedImage || isUploading}
            className={`mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isUploading || !capturedImage
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Art'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;