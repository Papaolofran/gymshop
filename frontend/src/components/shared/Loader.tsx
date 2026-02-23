import { LuLoaderCircle } from "react-icons/lu";

interface LoaderProps {
  className?: string;
  size?: number;
}

export const Loader = ({ className = "flex justify-center items-center h-[60vh]", size = 60 }: LoaderProps) => {
  return (
    <div className={className}>
      <LuLoaderCircle className="animate-spin text-gray-700" size={size}/>
    </div>
  );
};
