import { supabase } from "./supabase";

export const connectPlatform = async (provider) => {
  const { data, error } = await supabase.auth.linkIdentity({
    provider, // "twitter" or "linkedin_oidc"
    options: {
      redirectTo: `${window.location.origin}/brand-profile`,
      scopes: provider === "twitter"
        ? "tweet.read tweet.write users.read offline.access"
        : "openid profile email w_member_social",
    },
  });

  if (error) throw error;
  return data;
};

export const disconnectPlatform = async (provider) => {
  const { data: { identities } } = await supabase.auth.getUserIdentities();
  const identity = identities.find((i) => i.provider === provider);
  if (!identity) throw new Error("Identity not found");

  const { error } = await supabase.auth.unlinkIdentity(identity);
  if (error) throw error;
};

export const getConnectedPlatforms = async () => {
  const { data: { identities }, error } = await supabase.auth.getUserIdentities();
  if (error || !identities) return [];
  return identities.map((i) => i.provider);
};