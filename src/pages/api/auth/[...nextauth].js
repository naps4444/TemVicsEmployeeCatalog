import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("📌 Received login request:", credentials.email);

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          console.error("❌ User not found:", credentials.email);
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          console.error("❌ Invalid password for user:", credentials.email);
          throw new Error("Invalid email or password");
        }

        console.log("✅ Login successful:", user.email);

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department || "No Department",
          age: user.age || "Not Provided",
          education: user.education || "Not Provided",
          state: user.state || "Not Provided",
          religion: user.religion || "Not Provided",
          image: user.image || "/default-avatar.png",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("🔄 Generating JWT:", { id: user.id, role: user.role });
        token.id = user.id;
        token.role = user.role;
        token.department = user.department;
        token.age = user.age;
        token.education = user.education;
        token.state = user.state;
        token.religion = user.religion;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("🔄 Setting session:", { user: session.user, token });
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.department = token.department;
        session.user.age = token.age;
        session.user.education = token.education;
        session.user.state = token.state;
        session.user.religion = token.religion;
        session.user.image = token.image;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  useSecureCookies: process.env.NODE_ENV === "production",
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
