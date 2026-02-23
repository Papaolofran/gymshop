import { useState } from 'react';
import toast from 'react-hot-toast';
import { LuLoaderCircle } from 'react-icons/lu';

export const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;

      setIsLoading(true);
      
      // Simulamos un retraso para que se vea el spinner
      setTimeout(() => {
        toast.success(
          <div>
            ¡Suscripción exitosa!<br/>
            Te enviaremos novedades a:<br/><b>{email}</b>
          </div>,
          {
            duration: 5000,
          }
        );
        setEmail('');
        setIsLoading(false);
      }, 1500);
    };

    return (
    <div className="relative bg-gray-500 text-white py-20 px-4 md:px-6">
      {/*IMAGEN DE FONDO*/}
      <div className="absolute inset-0 bg-cover bg-center opacity-70 h-full"
        style={{backgroundImage: "url('/img/newsletter.jpg')"}}
      />

      {/*CONTENIDO DE NEWSLETTER*/}
      <div className="container z-10 relative p-5 md:p-0">
        <div className="w-full text-black bg-white p-12 space-y-5 md:w-[50%] lg:w-[40%]">
          <p className="text-xs uppercase font-semibold">
            Suscríbete a nuestro boletín y recibe promociones exclusivas
          </p>
          <p className="text-xs font-medium w-[80%] leading-5 text-gray-500">
            Introduce tu correo para recibir ofertas
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 xl:flex-row w-full relative">
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black rounded-full py-3 px-5 w-full text-xs font-medium disabled:opacity-50"
              placeholder="Correo electrónico"
            />

            <button 
              type="submit" 
              disabled={isLoading || !email}
              className="bg-black text-white font-semibold rounded-full uppercase tracking-wider py-3 text-xs xl:px-8 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {isLoading ? (
                <LuLoaderCircle className="animate-spin text-white" size={16} />
              ) : (
                'Suscríbete'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
    );
};