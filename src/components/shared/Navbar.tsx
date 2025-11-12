import { Link, NavLink } from "react-router-dom"
import { navbarLinks } from "../../constants/links"
import { HiOutlineSearch, HiOutlineShoppingBag, HiOutlineUser } from "react-icons/hi";
import { FaBarsStaggered } from "react-icons/fa6";
import { Logo } from "./Logo";
import { useGlobalStore } from "../../store/global.store";
import { useCartStore } from "../../store/cart.store";
import { useUser } from "../../hooks";
import { LuLoaderCircle } from "react-icons/lu";



export const Navbar = () => {
  const openSheet = useGlobalStore(state => state.openSheet);

  const setActiveNavMobile = useGlobalStore(state => state.setActiveNavMobile);

  const getTotalItems = useCartStore(state => state.getTotalItems);
  
  const totalItems = getTotalItems();

  const { session, isLoading } = useUser();

  return (
    <header className="bg-white text-black py-4 flex items-center justify-between px-5 border-b border-slate-200 lg:px-12 fixed top-0 left-0 right-0 z-50 shadow-sm">
      <Logo/>
      
      <nav className="space-x-5 hidden md:flex">
        {navbarLinks.map(link => (
          <NavLink
            key={link.id}
            to={link.href}
            className={({ isActive }) =>
              `${
                  isActive ? 'text-cyan-600 underline' : ''
              } transition-all duration-300 font-medium hover:text-cyan-600 hover:underline`
            }
          >
            {link.title}
          </NavLink>
        ))}
      </nav>

      <div className="flex gap-5 items-center">
        <button onClick={() => openSheet("search")} className="cursor-pointer">
          <HiOutlineSearch size={25}/>
        </button>

        {
          isLoading ? (
            <LuLoaderCircle className="animate-spin" size={25}/>
          ) : session ? (
            <div className="relative group">
              {/*User Avatar*/}
              <Link
                to="/account"
                className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 grid place-items-center text-white text-sm font-semibold cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                title="Mi cuenta"
              >
                <HiOutlineUser size={20}/>
              </Link>
            </div>
          ) : (
            <Link to="/login" className="hover:text-cyan-600 transition-colors">
              <HiOutlineUser size={25}/>
            </Link>
          )
        }

        <button className="relative cursor-pointer" onClick={() => openSheet("cart")}>
          {totalItems > 0 && (
            <span className="absolute -bottom-2 -right-2 w-5 h-5 grid place-items-center bg-black text-white text-xs rounded-full">
              {totalItems}
            </span>
          )}
          <HiOutlineShoppingBag size={25}/>
        </button>
      </div>

      <button className="md:hidden cursor-pointer" onClick={() => setActiveNavMobile(true)}>
        <FaBarsStaggered size={25}/>
      </button>
    </header>
  );
};
