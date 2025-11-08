import { useState } from "react";
import { HiPhoto } from "react-icons/hi2";

interface Props {
  images: string[];
}

export const GridImages = ({images}: Props) => {
  
  const [activeImage, setActiveImage] = useState(images[0] || '');

  const handleImageClick = (image: string) => {
    setActiveImage(image);
  };
  
  return (
    <div className="flex-1 flex flex-col gap-3 relative">
      <div className="bg-[#f2f2f2] w-full aspect-square p-8 flex items-center justify-center rounded-lg">
        {activeImage ? (
          <img
            src={activeImage}
            alt="Imagen de Producto"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <HiPhoto size={120} />
            <p className="text-lg mt-4">Sin imagen disponible</p>
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 0 && (
        <div className="flex mt-4 gap-2">
          {images.map((image, index) => (
          <button
            key={index}
            onClick={() => handleImageClick(image)}
            className={`w-20 h-20 p-1.5 border-2 bg-gray-50 ${activeImage === image ?
            "border-black" : "border-gray-200"} rounded-lg hover:border-black focus:outline-none transition-colors`}
          >
            <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-contain rounded" />
          </button>
          ))}
        </div>
      )}
    </div>
  );
};
