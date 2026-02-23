import { useMutation } from "@tanstack/react-query";
import { resetPasswordForEmail } from "../../actions";
import toast from "react-hot-toast";

export const useResetPasswordRequest = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: resetPasswordForEmail,
    onSuccess: () => {
      toast.success("Se ha enviado un correo para restablecer tu contraseña");
    },
    onError: (error: Error) => {
      toast.error("Error al enviar el correo: " + error.message);
    },
  });

  return {
    mutate,
    isPending,
  };
};
