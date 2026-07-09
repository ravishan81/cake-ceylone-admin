import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { UploadCloud, Image as ImageIcon, X, CheckCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import useHomePageStore from '../lib/homePageStore'

export default function ImageUpload() {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const inputRef = useRef(null)

  const updateHomePageImage = useHomePageStore((state) => state.updateHomePageImage)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (validFiles.length !== files.length) {
      toast.error('Some files were not images and were ignored')
    }
    
    if (selectedFiles.length + validFiles.length > 4) {
      toast.error('You can only upload a maximum of 4 images')
      return
    }

    const newFiles = [...selectedFiles, ...validFiles].slice(0, 4)
    setSelectedFiles(newFiles)
    
    // Revoke old urls to prevent memory leaks
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    setPreviewUrls(newFiles.map(f => URL.createObjectURL(f)))
    setUploadComplete(false)
  }

  const handleRemove = (index) => {
    const newFiles = [...selectedFiles]
    newFiles.splice(index, 1)
    
    const newUrls = [...previewUrls]
    URL.revokeObjectURL(newUrls[index])
    newUrls.splice(index, 1)
    
    setSelectedFiles(newFiles)
    setPreviewUrls(newUrls)
    setUploadComplete(false)
    
    if (newFiles.length === 0 && inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return
    setIsUploading(true)

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      toast.error('Cloudinary configuration is missing. Please check your .env file.')
      setIsUploading(false)
      return
    }

    try {
      const uploadedUrls = []
      
      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', uploadPreset)

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url)
        } else {
          throw new Error(data.error?.message || 'Failed to upload image')
        }
      }

      // Format payload as requested by the backend: array of objects [ { image1: url }, { image2: url } ]
      const payloadArray = uploadedUrls.map((url, index) => ({
        [`image${index + 1}`]: url
      }))

      // Save to backend database
      try {
        await updateHomePageImage(payloadArray)
        toast.success(`Successfully uploaded and saved ${uploadedUrls.length} image(s)!`)
        setUploadComplete(true)
      } catch (err) {
        console.error('Failed to save image URLs to database', err)
        toast.error('Images uploaded to Cloudinary, but failed to save to database.')
      }

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('An error occurred while uploading the images.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleReset = () => {
    setSelectedFiles([])
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    setPreviewUrls([])
    setUploadComplete(false)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-slate-100 text-2xl font-bold">Upload Images</h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload up to 4 images to your gallery via drag and drop or clicking.
        </p>
      </div>

      <div className="bg-[#141420] border border-white/5 rounded-2xl p-8">
        {selectedFiles.length === 0 ? (
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors duration-200
              ${dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 bg-[#0f0f14] hover:border-slate-600'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <UploadCloud size={32} className={dragActive ? 'text-purple-400' : 'text-slate-400'} />
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">
              Drag and drop your images here
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              or click to browse your files. Supports JPG, PNG, WEBP (Max 4 images).
            </p>
            <Button variant="primary" size="md" onClick={() => inputRef.current?.click()}>
              Select Files
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative rounded-xl overflow-hidden bg-black/40 border border-white/5 aspect-video flex items-center justify-center">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                  {!isUploading && !uploadComplete && (
                    <button
                      onClick={() => handleRemove(index)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              
              {selectedFiles.length < 4 && !isUploading && !uploadComplete && (
                <div 
                  onClick={() => inputRef.current?.click()}
                  className="relative rounded-xl border-2 border-dashed border-slate-700 bg-black/20 hover:border-slate-500 aspect-video flex flex-col items-center justify-center cursor-pointer transition-colors group"
                >
                  <UploadCloud size={24} className="text-slate-500 mb-2 group-hover:text-purple-400 transition-colors" />
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    Add more ({4 - selectedFiles.length} left)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-[#0f0f14] border border-white/5 gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <ImageIcon size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                    {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-xs text-slate-500">
                    Max 4 allowed
                  </p>
                </div>
              </div>

              {uploadComplete ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">Uploaded Successfully</span>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
                </Button>
              )}
            </div>

            {uploadComplete && (
              <div className="space-y-4 mt-4">
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-sm font-medium text-purple-300 mb-2">Upload Successful!</p>
                  <div className="flex flex-col gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={url}
                          className="flex-1 bg-[#0f0f14] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-purple-500/50"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(url)
                            toast.success(`URL ${index + 1} copied!`)
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="secondary" size="md" onClick={handleReset}>
                    Upload More Images
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
