"use server";

import { MessageRole, MessageType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import { getCurrentUser } from "@/modules/auth/auth.actions";

export const createMessages = async (value: string, projectId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
      userId: user.id,
    },
  });

  if (!project) throw new Error("Project not found or unauthorized");

  const newMessage = await prisma.message.create({
    data: {
      projectId: projectId,
      content: value,
      role: MessageRole.USER,
      type: MessageType.RESULT,
    },
  });

  await inngest.send({
    name: "code-agent/run",
    data: {
      value: value,
      projectId: projectId,
    },
  });

  return newMessage;
};

export const getMessages = async (projectId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
      userId: user.id,
    },
  });

  if (!project) throw new Error("Project not found or unauthorized");

  const messages = await prisma.message.findMany({
    where: { projectId },
    orderBy: { updatedAt: "asc" },
    include: { fragments: true },
  });

  return messages;
};
