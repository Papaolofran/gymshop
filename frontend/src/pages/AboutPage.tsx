import { LuDumbbell, LuHeart, LuShieldCheck, LuTrophy, LuMail, LuPhone } from "react-icons/lu";

export const AboutPage = () => {
  return (
    <div className="w-full -mt-14">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center border-t-0">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10" />
        <img 
          src="/img/Nosotros.jpeg" 
          alt="GymShop" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-blue-500 font-bold tracking-widest uppercase mb-4 block text-sm">Nuestra Historia</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 uppercase tracking-tight">
            Más que una tienda, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">un estilo de vida</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl font-medium max-w-2xl">
            Nacimos con la misión de equipar a deportistas de todos los niveles con la mejor calidad en indumentaria, accesorios y suplementos.
          </p>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-30">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col items-center text-center group transition-colors duration-300">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <LuTrophy size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Nuestra Misión</h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              Empoderar a nuestros clientes para alcanzar su máximo potencial físico y mental, proveyendo los productos de la más alta calidad y acompañándolos en cada paso de su transformación.
            </p>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col items-center text-center group transition-colors duration-300">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <LuDumbbell size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Nuestra Visión</h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              Ser el punto de referencia indispensable para cualquier entusiasta del fitness y el deporte en toda la región, inspirando a millones a adoptar hábitos saludables.
            </p>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="bg-gray-50 py-24 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-4">Nuestros Valores</h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-medium">En GymShop no solo vendemos productos, sino que vivimos bajo 3 pilares fundamentales que nos definen como marca.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Valor 1 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-black text-white rounded-full flex items-center justify-center mb-6 shadow-xl">
                <LuShieldCheck size={36} />
              </div>
              <h3 className="text-xl font-bold mb-3 uppercase">Calidad Sin Compromiso</h3>
              <p className="text-gray-600 font-medium text-sm leading-relaxed">
                Seleccionamos rigurosamente cada producto, desde el bordado de la ropa hasta la pureza de la proteína, para asegurarnos de que recibas solo lo mejor.
              </p>
            </div>
            {/* Valor 2 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-black text-white rounded-full flex items-center justify-center mb-6 shadow-xl">
                <LuHeart size={36} />
              </div>
              <h3 className="text-xl font-bold mb-3 uppercase">Pasión por el Cliente</h3>
              <p className="text-gray-600 font-medium text-sm leading-relaxed">
                Tu meta es la nuestra. Brindamos una atención cercana e inmediata para resolver todas tus dudas antes, durante y después de tu compra.
              </p>
            </div>
            {/* Valor 3 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-black text-white rounded-full flex items-center justify-center mb-6 shadow-xl">
                <LuTrophy size={36} />
              </div>
              <h3 className="text-xl font-bold mb-3 uppercase">Motivación Constante</h3>
              <p className="text-gray-600 font-medium text-sm leading-relaxed">
                Creemos que el deporte transforma vidas. Buscamos inspirarte día a día a ser tu mejor versión y romper tus propios récords.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="w-full bg-gradient-to-br from-blue-900 via-blue-800 to-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight">Estamos para ayudarte</h2>
          <p className="text-blue-100 text-lg font-medium max-w-2xl mx-auto">
            ¿Tienes alguna consulta corporativa, duda sobre un producto o simplemente quieres saludar? ¡Escríbenos!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
            <a href="mailto:gymshop.ayuda@gmail.com" className="flex items-center justify-center gap-3 bg-white text-blue-900 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors">
              <LuMail size={24} />
              gymshop.ayuda@gmail.com
            </a>
            <a href="tel:+5491122334455" className="flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-colors">
              <LuPhone size={24} />
              +54 9 11 2233-4455
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};