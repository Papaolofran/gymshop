import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut, updatePassword } from "../../actions";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useUpdatePassword = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: updatePassword,
    onSuccess: async () => {
      await signOut();
      queryClient.setQueryData(["user"], null);
      toast.success("Contraseña actualizada. Por favor, inicia sesión con tu nueva contraseña.");
      navigate("/login");
    },
    onError: (error: Error) => {
      toast.error("Error al actualizar la contraseña: " + error.message);
    },
  });

  return {
    mutate,
    isPending,
  };
};
