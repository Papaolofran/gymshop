import { ImSpinner9 } from "react-icons/im"

export const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <ImSpinner9 className="animate-spin text-gray-700" size={70}/>
    </div>
  );
};
