import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;

import { supabase } from "@/lib/supabaseClient";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt", 
  },

  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify guilds" } },
    }),
  ],

  pages: {
    error: "/unauthorized", // Redirect users who fail sign-in here
  },

  callbacks: {
    async signIn({ user, account }) {
      if (!account?.access_token) return false;

      try {
        const guildsResponse = await fetch("https://discord.com/api/users/@me/guilds", {
          headers: { Authorization: `Bearer ${account.access_token}` },
        });

        if (!guildsResponse.ok) {
          console.error("Failed to fetch guilds:", guildsResponse.statusText);
          return false;
        }

        const guilds = await guildsResponse.json();

        // Check if the user is in the allowed Discord server
        const inGuild = guilds.some((g: any) => g.id === DISCORD_GUILD_ID);

        if (inGuild) {
          // Sync user to Supabase
          if (user?.name) {
            const { error } = await supabase
              .from('user')
              .select('id')
              .eq('username', user.name)
              .single()
              .then(async ({ data }) => {
                if (!data) {
                  // User doesn't exist, create new one
                  return await supabase.from('user').insert({ username: user.name });
                }
                // User exists, do nothing (or update if we had more fields)
                return { error: null };
              });

            if (error) {
              console.error("Failed to sync user to Supabase:", error);
              // We don't block sign-in if sync fails, but logging it is good
            }
          }
          
          return true; // Allow sign-in
        } else {
          throw new Error("UNAUTHORIZED_GUILD");
        }
      } catch (err) {
        console.error("Error checking guild membership:", err);
        // Any unexpected error should still lead to the unauthorized page
        throw new Error("UNAUTHORIZED_GUILD");
      }
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;

        // Ensure user is synced to Supabase even if they are already logged in
        if (session.user.name) {
          // We perform a "lazy" sync here. 
          // Ideally, we could optimize this to not run on every session check,
          // but for now, we'll rely on the fact that checking existence is cheap.
          try {
             const { data } = await supabase
              .from('user')
              .select('id')
              .eq('username', session.user.name)
              .single();
            
             if (!data) {
                await supabase.from('user').insert({ username: session.user.name });
             }
          } catch (err) {
             // Ignore errors here to not disrupt the session flow
             console.error("Session sync error:", err);
          }
        }
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
