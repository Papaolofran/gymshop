export const AboutPage = () => {
    return (
        <div className="space-y-5">

            <h1 className="text-center text-4xl font-semibold tracking-tight mb-5">
                Sobre Nosotros
            </h1>

            <img src="/img/Nosotros.jpeg" alt="Imagen de fondo" className="w-full h-auto max-h-[600px] object-cover"/>

            <div className="flex flex-col gap-4 tracking-tight leading-7 text-sm font-medium text-slate-800">
                <p>
                    {/*PONER DESCRIPCION DE LA EMPRESA*/}
                    GymShop es una tienda en línea que ofrece una amplia gama de productos de calidad, desde ropa deportiva hasta suplementos para mejorar tu estilo de vida.
                </p>

                <p>
                    En GymShop, nos comprometemos a brindarte la mejor experiencia de compra. Nuestra tienda en línea ofrece una amplia gama de productos de calidad, desde ropa deportiva hasta accesorios y equipo de gimnasio. 
                </p>

                <h2 className="text-3xl font-semibold tracking-tight mt-8 mb-4">
                    ¡No esperes más y compra tus productos en GymShop!
                </h2>

                <p>
                    Para más información, no dudes en contactarnos a través de nuestro correo electrónico:
                    <a href="mailto:contacto@gymshop.com"> contacto@gymshop.com</a> o llamando al número:
                    <a href="tel:+5491122334455"> +54 9 11 2233-4455</a>
                </p>
            </div>
        </div>
    );
};