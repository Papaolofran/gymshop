import { IoMdClose } from "react-icons/io";
import { Link, NavLink } from "react-router-dom";
import { navbarLinks } from "../../constants/links.tsx";
import { useGlobalStore } from "../../store/global.store.ts";

export const NavbarMobile = () => {

  const setActiveNavMobile = useGlobalStore(state => 
      state.setActiveNavMobile
    );





  return <div className="bg-white text-black h-screen w-full shadow-lg animate-slide-in-left fixed z-50 flex items-start justify-center pt-20">
    <button className="absolute top-5 right-5"
      onClick={() => setActiveNavMobile(false)}>
      <IoMdClose size={30} className="text-black"/>
    </button>

    {/* Contenido principal */}
    <div className="flex flex-col items-center gap-10">
      <Link 
        to="/" 
        className="text-4xl font-bold tracking-tighter transition-all text-center"
        onClick={() => setActiveNavMobile(false)}
      >
        <p>
          Gym<span className="text-cyan-600">Shop</span>
        </p>
      </Link>

      <nav className="flex flex-col items-center gap-5">
        {navbarLinks.map(item => (
          <NavLink
            to={item.href}
            key={item.id}
            onClick={() => setActiveNavMobile(false)}
            className={({isActive}) => `
              ${isActive ? 'text-cyan-600 underline' : ''} 
              transition-all duration-300 font-semibold text-xl 
              hover:text-cyan-600 hover:underline text-center
            `}
          >
            {item.title}
          </NavLink>
        ))}
      </nav>
    </div>


  </div>;
}