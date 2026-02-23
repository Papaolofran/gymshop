import { BiChevronRight } from "react-icons/bi";
import { Link } from "react-router-dom";
import { socialLinks } from "../../constants/links";
import { useState } from "react";
import toast from "react-hot-toast";
import { LuLoaderCircle } from "react-icons/lu";

export const Footer = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;

      setIsLoading(true);
      
      setTimeout(() => {
        toast.success(
          <div>
            ¡Gracias por suscribirte!<br />
            Tu correo <b>{email}</b> ha sido registrado exitosamente.
          </div>,
          { duration: 4000 }
        );
        setEmail('');
        setIsLoading(false);
      }, 1500);
    };

    return (
      <footer className="py-16 bg-gray-950 px-12 flex justify-between gap-10 text-slate-200 text-sm flex-wrap mt-10 md:flex-nowrap">
        <Link
          to="/"
          className={`text-2xl font-bold tracking-tighter transition-all text-white flex-1`}
          >
            GymShop
        </Link>

        <div className="flex flex-col gap-4 flex-1">
          <p className="font-semibold uppercase tracking-tighter">
            Suscríbete
          </p>

          <p className="text-xs font-medium">
            Recibe promociones exclusivas
          </p>

          <form onSubmit={handleSubscribe} className="border border-gray-800 flex items-center gap-2 px-3 py-2 rounded-full ring-offset-gray-950 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="Correo electrónico"
              className="pl-2 bg-transparent text-slate-200 w-full focus:outline-none disabled:opacity-50"
            />

            <button 
              type="submit"
              disabled={isLoading || !email} 
              className="text-slate-200 hover:text-white transition-colors disabled:opacity-50 p-1"
            >
              {isLoading ? <LuLoaderCircle className="animate-spin" size={20} /> : <BiChevronRight size={20} />}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-4 flex-1">
          <p className="font-semibold uppercase tracking-tighter">
            Políticas
          </p>

          <nav className="flex flex-col gap-2 text-xs font-medium">
            <Link to="/productos">Productos</Link>
            <Link to="#" className="text-slate-300 hover:text-white">
              Políticas de privacidad
            </Link>
            <Link to="#" className="text-slate-300 hover:text-white">
              Términos de uso
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-4 flex-1">
          <p className="font-semibold uppercase tracking-tighter">
            Síguenos
          </p>

          <p className="text-xs leading-6">
            Síguenos en nuestras redes sociales para estar al tanto de las últimas novedades.
          </p>
          
          <div className="flex">
            {socialLinks.map((link) => (
              <a key={link.id}
                 href={link.href}
                 target="_blank"
                 rel="noreferrer"
                 className="text-slate-300 border border-gray-800 w-full h-full py-3.5 flex items-center justify-center transition-all hover:bg-white hover:text-gray-950">
                {link.icon}
              </a>
            ))}
          </div>
        </div>
    </footer>
    );
};