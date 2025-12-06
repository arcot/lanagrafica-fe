import { insertMember, renewMember, updateMember } from "@/api/memberService";
import { MemberInsert, MemberUpdate } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

export type RenewMutation = {
  mutate: (args: { id: string; expirationDate: string; name: string }) => void;
};

export type UpdateMutation = {
  mutate: (args: { id: string; details: MemberUpdate; name: string }) => void;
};

export type InsertMutation = {
  mutate: (args: { details: MemberInsert; name: string }) => void;
};

export function useMembersMutations() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { getAccessToken } = useAuth();

  const renewMutation = useMutation({
    mutationFn: async (variables: {
      id: string;
      expirationDate: string;
      name: string;
    }) => {
      const token = await getAccessToken();
      return renewMember(variables.id, variables.expirationDate, token);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success(t("membersTable.updateSuccess", { name: variables.name }));
    },
    onError: (error, variables) => {
      console.error(t("membersTable.updateError"), error);
      toast.error(
        t("membersTable.updateError", {
          name: variables.name,
        }),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (variables: {
      id: string;
      details: MemberUpdate;
      name: string;
    }) => {
      const token = await getAccessToken();
      return updateMember(variables.id, variables.details, token);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success(t("membersTable.updateSuccess", { name: variables.name }));
    },
    onError: (error, variables) => {
      console.error(t("membersTable.updateError"), error);
      toast.error(
        t("membersTable.updateError", {
          name: variables.name,
        }),
      );
    },
  });

  const insertMutation = useMutation({
    mutationFn: async (variables: { details: MemberInsert; name: string }) => {
      const token = await getAccessToken();
      return insertMember(variables.details, token);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success(t("newMember.insertSuccess", { name: variables.name }));
    },
    onError: (error, variables) => {
      console.error(t("newMember.insertError"), error);
      toast.error(
        t("newMember.insertError", {
          name: variables.name,
        }),
      );
    },
  });
  return { renewMutation, updateMutation, insertMutation };
}
