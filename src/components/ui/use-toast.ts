// Chemin : src/components/ui/use-toast.ts

export const useToast = () => {
  const toast = (message: string) => {
    console.log("Toast message:", message);
  };

  return { toast };
};
