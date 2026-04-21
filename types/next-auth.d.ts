import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            phone?: string
            wakeUpTime?: string;
            whatsappEnabled?: boolean
            wakatimeApiKey?: string
            githubApiKey?: string
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        phone?: string
        wakeUpTime?: string;
        whatsappEnabled?: boolean
        wakatimeApiKey?: string
        githubApiKey?: string
        password?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        phone?: string
        wakeUpTime?: string;
        whatsappEnabled?: boolean
        wakatimeApiKey?: string
        githubApiKey?: string
    }
}
