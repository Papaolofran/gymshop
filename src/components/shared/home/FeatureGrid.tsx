import { MdLocalShipping } from "react-icons/md";
import { HiMiniReceiptRefund } from "react-icons/hi2";
import { BiSupport } from "react-icons/bi";
import { BiWorld } from "react-icons/bi";

export const FeatureGrid = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mt-6 mb-16">
            <div className="flex items-center justify-center sm:justify-start gap-4 text-center sm:text-left">
              <MdLocalShipping size={40} className="text-slate-600"/>

              <div className="space-y-1">
                <p className="font-semibold">
                  Envío gratis
                </p>

                <p className="text-sm">
                  En todos nuestros productos
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-4 text-center sm:text-left">
              <HiMiniReceiptRefund size={40} className="text-slate-600"/>

              <div className="space-y-1">
                <p className="font-semibold">
                  Devoluciones
                </p>

                <p className="text-sm">
                  Devolución en un plazo de 30 días
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-4 text-center sm:text-left">
              <BiSupport size={40} className="text-slate-600"/>

              <div className="space-y-1">
                <p className="font-semibold">
                  Asesoramiento deportivo
                </p>

                <p className="text-sm">
                  Consulta con nuestros expertos
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-4 text-center sm:text-left">
              <BiWorld size={40} className="text-slate-600"/>

              <div className="space-y-1">
                <p className="font-semibold">
                  Garantía
                </p>

                <p className="text-sm">
                  Garantía de 2 meses en vestimenta deportiva
                </p>
              </div>
            </div>
        </div>
    );
};