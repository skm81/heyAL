import logger from "@hey/helpers/logger";
import type { Request, Response } from "express";
import catchedError from "src/helpers/catchedError";
import { resolverAbi } from "src/helpers/ens/resolverAbi";
import { rateLimiter } from "src/helpers/middlewares/rateLimiter";
import { invalidBody, noBody } from "src/helpers/responses";
import { http, createPublicClient, fallback } from "viem";
import { mainnet } from "viem/chains";
import { array, object, string } from "zod";

interface ExtensionRequest {
  addresses: string[];
}

const validationSchema = object({
  addresses: array(string().regex(/^(0x)?[\da-f]{40}$/i)).max(100)
});

export const post = [
  rateLimiter({ requests: 100, within: 1 }),
  async (req: Request, res: Response) => {
    const { body } = req;

    if (!body) {
      return noBody(res);
    }

    const validation = validationSchema.safeParse(body);

    if (!validation.success) {
      return invalidBody(res);
    }

    const { addresses } = body as ExtensionRequest;

    try {
      const client = createPublicClient({
        chain: mainnet,
        transport: fallback([
          http("https://ethereum.publicnode.com"),
          http("https://rpc.ankr.com/eth"),
          http("https://cloudflare-eth.com"),
          http("https://eth.merkle.io")
        ])
      });

      const result = await client.readContract({
        abi: resolverAbi,
        address: "0x3671ae578e63fdf66ad4f3e12cc0c0d71ac7510c",
        args: [addresses],
        functionName: "getNames"
      });
      logger.info("ENS names fetched");

      return res.status(200).json({ result, success: true });
    } catch (error) {
      return catchedError(res, error);
    }
  }
];
