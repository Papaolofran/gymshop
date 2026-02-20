import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser } from "../../actions";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      toast.success("Sesión iniciada correctamente");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate("/");
    },
    onError: (error: Error) => {
      toast.error("Error al iniciar sesión: " + error.message);
    },
  });

  return {
    mutate,
    isPending,
  };
};
