"use server"

import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

export const onboardUser = async () => {
    try {
        const user = await currentUser()
        if (!user) return
        const {id, firstName, lastName, emailAddresses, imageUrl} = user
        const existingUser = await prisma.user.findUnique({
            where: { clerkId: user.id }
        })

        if (existingUser) {
            return existingUser
        }
        console.log("Onboarding new user:")
        const newUser = await prisma.user.upsert({
            where: {clerkId: id},
            update: {},
            create: {
                clerkId: id,
                name: `${firstName} ${lastName}`,
                email: emailAddresses[0].emailAddress,
                image: imageUrl || null,
            },
        })
        return newUser
    } catch (error) {
        console.error("Error onboarding user:", error)
        throw new Error("Failed to onboard user")
    }
}

export const getCurrentUser = async () => {
  try {
    const user = await currentUser()
    if (!user) return

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        clerkId: true,
      },
    });

    return dbUser;
  } catch (error) {
    console.error("Error Fetching user:", error)
    throw new Error("Failed to fetch user")
  }
};
