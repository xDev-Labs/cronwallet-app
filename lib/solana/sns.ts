import { resolve } from "@bonfida/spl-name-service";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

/**
 * Resolves a .sol domain name to a Solana public key
 * @param domain - The .sol domain name (e.g., "example.sol")
 * @returns The resolved public key or null if not found
 */
export async function resolveSolDomain(
  domain: string
): Promise<{ publicKey: PublicKey; exists: boolean } | null> {
  try {
    // Remove .sol extension if present
    const domainName = domain.endsWith(".sol") ? domain.slice(0, -4) : domain;

    const connection = new Connection(
      clusterApiUrl("mainnet-beta") ||
        process.env.EXPO_PUBLIC_SOLANA_RPC_URL ||
        ""
    );

    const owner = await resolve(connection, domainName);

    if (owner) {
      return {
        publicKey: owner,
        exists: true,
      };
    }

    return null;
  } catch (error: any) {
    // Handle rate limiting gracefully
    if (
      error?.message?.includes("429") ||
      error?.message?.includes("Too many requests")
    ) {
      console.log(
        "SNS resolution rate limited. Please use a private RPC endpoint."
      );
    } else {
      console.log("SNS resolution error:", error?.message || error);
    }
    return null;
  }
}

/**
 * Validates if a .sol domain exists
 * @param domain - The .sol domain name
 * @returns True if the domain exists and is registered
 */
export async function validateSolDomain(domain: string): Promise<boolean> {
  const result = await resolveSolDomain(domain);
  return result !== null && result.exists;
}
