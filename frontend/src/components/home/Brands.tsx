const brands = [
  {
    image: "/img/brands/ena_logo.webp",
    alt: "Ena",  
  },
  {
    image: "/img/brands/gentech_logo.webp",
    alt: "Gentech",
  },
  {
    image: "/img/brands/star_logo.webp",
    alt: "Star Nutrition",
  },
  {
    image: "/img/brands/nike_logo.png",
    alt: "Nike",
  },
  {
    image: "/img/brands/adidas_logo.png",
    alt: "Adidas",
  },
  {
    image: "/img/brands/under_logo.png",
    alt: "Under Armour",
  },
];

export const Brands = () => {
  return (
    <div className="flex flex-col items-center gap-3 pt-6 pb-12">
      <h2 className="font-bold text-2xl">Marcas</h2>

      <p className="w-2/3 text-center text-sm md:text-base">
        Encuentra los mejores productos en nuestra tienda online.
      </p>

      <div className="grid grid-cols-3 gap-6 mt-8 items-center md:grid-cols-6">
        {brands.map((brand, index) => (
          <div key={index}>
            <img
              src={brand.image}
              alt={brand.alt}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
