export const PrivacyPoliciesPage = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <h1 className="text-4xl font-bold tracking-tight mb-8">Políticas de Privacidad</h1>
            
            <div className="space-y-8 text-gray-700 leading-relaxed font-medium">
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-black">1. Información que Recopilamos</h2>
                    <p>En GymShop valoramos tu privacidad. Recopilamos información personal que nos proporcionas directamente, como tu nombre, dirección de correo electrónico, dirección de envío y detalles de pago cuando realizas una compra o te registras en nuestra tienda.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-black">2. Uso de tu Información</h2>
                    <p>Utilizamos la información recopilada para procesar tus pedidos, enviarte confirmaciones y actualizaciones sobre tus compras, mejorar nuestra tienda en línea, y (si te has suscrito) enviarte información sobre nuevos productos y promociones especiales.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-black">3. Protección de Datos</h2>
                    <p>Implementamos diversas medidas de seguridad para mantener la seguridad de tu información personal. Todo proceso de pago se realiza a través de plataformas seguras y encriptadas (como MercadoPago) por lo que no almacenamos detalles confidenciales de tus métodos de pago en nuestros servidores.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-black">4. Compartir Información</h2>
                    <p>No vendemos, intercambiamos ni transferimos a terceros tu información personal identificable. Esto no incluye a terceros de confianza que nos asisten en la operación de nuestro sitio web o en la conducción de nuestro negocio (ej. servicios de paquetería), siempre que dichas partes acuerden mantener esta información confidencial.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-black">5. Tus Derechos</h2>
                    <p>Tienes el derecho de acceder, corregir o eliminar tu información personal registrada en nuestro sistema en cualquier momento. Si deseas ejercer estos derechos o tienes preguntas, puedes contactarnos a través de gymshop.ayuda@gmail.com.</p>
                </section>
                
                <p className="mt-8 text-sm text-gray-500">
                    Última actualización: Noviembre 2024
                </p>
            </div>
        </div>
    );
};
