import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { createMessages, getMessages } from "./message.actions";

export const prefetchMessages = async (queryClient: QueryClient, projectId: string) => {
  await queryClient.prefetchQuery({
    queryKey: ["messages", projectId],
    queryFn: () => getMessages(projectId),
    staleTime: 10000, 
  });
};

export const useGetMessages = (projectId: string) => {
  return useQuery({
    queryKey: ["messages", projectId], 
    queryFn: () => getMessages(projectId),
    staleTime: 5000,
    refetchInterval: (query) => {
      const messages = query.state.data;
      if (!messages || messages.length === 0) return false;      
      const lastMessage = messages[messages.length - 1];
      return lastMessage.role === "USER" ? 3000 : false;
    },
  });
};

export const useCreateMessages = (projectId: string) => {
  const queryClient = useQueryClient();  
  return useMutation({
    mutationFn: (value: string) => createMessages(value, projectId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["messages", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["status"] })
      ]);
    },
  });
};