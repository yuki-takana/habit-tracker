import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT) || 587,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) {
                    throw new Error("Invalid credentials");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    phone: user.phone ?? undefined,
                    wakeupTime: user.wakeUpTime ?? undefined,
                    whatsappEnabled: user.whatsappEnabled,
                    wakatimeApiKey: user.wakatimeApiKey ?? undefined,
                    githubApiKey: user.githubApiKey ?? undefined,
                };
            }
        }),
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: '/',
    },
    callbacks: {
        jwt: async ({ token, user, trigger, session }) => {
            if (user) {
                token.id = user.id;
                token.phone = user.phone;
                token.wakeUpTime = user.wakeUpTime;
                token.whatsappEnabled = user.whatsappEnabled;
                token.wakatimeApiKey = user.wakatimeApiKey;
                token.githubApiKey = user.githubApiKey;
            }
            if (trigger === "update" && session) {
                return { ...token, ...session.user }
            }
            if (token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id }
                });

                if (dbUser) {
                    token.phone = dbUser.phone ?? undefined;
                    token.wakeUpTime = dbUser.wakeUpTime ?? undefined;
                    token.whatsappEnabled = dbUser.whatsappEnabled ?? undefined;
                    token.wakatimeApiKey = dbUser.wakatimeApiKey ?? undefined;
                    token.githubApiKey = dbUser.githubApiKey ?? undefined;
                }
            }

            return token;
        },
        session: async ({ session, token }) => {
            if (session.user && token) {
                session.user.id = token.id;
                session.user.phone = token.phone;
                session.user.wakeUpTime = token.wakeUpTime;
                session.user.whatsappEnabled = token.whatsappEnabled;
                session.user.wakatimeApiKey = token.wakatimeApiKey;
                session.user.githubApiKey = token.githubApiKey;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
