import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerUser } from "../../actions";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useRegister = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // mutation es una operacion que modifica el estado de la aplicacion

  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Registro exitoso. Por favor, verifica tu correo electrónico.");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate("/");
    },
    onError: (error: Error) => {
      toast.error("Error al registrarse: " + error.message);
    },
  });

  return {
    mutate,
    isPending,
  };
};