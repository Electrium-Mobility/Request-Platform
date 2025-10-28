import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt", // use JWT for session management
  },

  // 🟦 Discord Provider
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify guilds" } },
    }),
  ],

  // 🟨 Custom error pages
  pages: {
    error: "/unauthorized", // Redirect users who fail sign-in here
  },

  callbacks: {
    /**
     * 🔹 signIn() runs when a user tries to sign in
     * We use it to check if the user is in the correct Discord server.
     */
    async signIn({ account }) {
      if (!account?.access_token) return false;

      try {
        // Fetch the list of guilds the user is in
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
          return true; // ✅ Allow sign-in
        } else {
          // ❌ Not in guild → trigger custom error page redirect
          throw new Error("UNAUTHORIZED_GUILD");
        }
      } catch (err) {
        console.error("Error checking guild membership:", err);
        // Any unexpected error should still lead to the unauthorized page
        throw new Error("UNAUTHORIZED_GUILD");
      }
    },

    /**
     * 🔹 session() customizes the session object sent to the client
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
