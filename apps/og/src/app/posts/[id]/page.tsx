import getCollectModuleMetadata from "@helpers/getCollectModuleMetadata";
import getPublicationOGImages from "@helpers/getPublicationOGImages";
import { APP_NAME } from "@hey/data/constants";
import getProfile from "@hey/helpers/getProfile";
import getPublicationData from "@hey/helpers/getPublicationData";
import logger from "@hey/helpers/logger";
import { isMirrorPublication } from "@hey/helpers/publicationHelpers";
import type { AnyPublication } from "@hey/lens";
import { PublicationDocument } from "@hey/lens";
import { addTypenameToDocument } from "apollo-utilities";
import { print } from "graphql";
import type { Metadata } from "next";
import defaultMetadata from "src/defaultMetadata";

interface Props {
  params: Promise<{ id: string }>;
}

export const generateMetadata = async ({
  params
}: Props): Promise<Metadata> => {
  const { id } = await params;

  const response = await fetch("https://api-v2.lens.dev", {
    body: JSON.stringify({
      operationName: "Publication",
      query: print(addTypenameToDocument(PublicationDocument)),
      variables: { request: { forId: id } }
    }),
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  const result = await response.json();

  if (!result.data.publication) {
    return defaultMetadata;
  }

  const publication = result.data.publication as AnyPublication;
  const targetPublication = isMirrorPublication(publication)
    ? publication.mirrorOn
    : publication;
  const { by: profile, metadata } = targetPublication;
  const filteredContent = getPublicationData(metadata)?.content || "";
  const filteredAsset = getPublicationData(metadata)?.asset;
  const assetIsAudio = filteredAsset?.type === "Audio";

  const { displayName, link, slugWithPrefix } = getProfile(profile);
  const title = `${targetPublication.__typename} by ${slugWithPrefix} • ${APP_NAME}`;
  const description = (filteredContent || title).slice(0, 155);

  return {
    alternates: { canonical: `https://hey.xyz/posts/${targetPublication.id}` },
    applicationName: APP_NAME,
    authors: {
      name: displayName,
      url: `https://hey.xyz${link}`
    },
    creator: displayName,
    description: description,
    keywords: [
      "hey",
      "hey.xyz",
      "social media post",
      "social media",
      "lenster",
      "polygon",
      "profile post",
      "like",
      "share",
      "post",
      "publication",
      "lens",
      "lens protocol",
      "decentralized",
      "web3",
      displayName,
      slugWithPrefix
    ],
    metadataBase: new URL(`https://hey.xyz/posts/${targetPublication.id}`),
    openGraph: {
      description: description,
      images: getPublicationOGImages(metadata) as any,
      siteName: "Hey",
      type: "article",
      url: `https://hey.xyz/posts/${targetPublication.id}`
    },
    other: {
      "count:actions": targetPublication.stats.countOpenActions,
      "count:comments": targetPublication.stats.comments,
      "count:likes": targetPublication.stats.reactions,
      "count:mirrors": targetPublication.stats.mirrors,
      "count:quotes": targetPublication.stats.quotes,
      "lens:id": targetPublication.id,
      ...getCollectModuleMetadata(targetPublication)
    },
    publisher: displayName,
    title: title,
    twitter: {
      card: assetIsAudio ? "summary" : "summary_large_image",
      site: "@heydotxyz"
    }
  };
};

const Page = async ({ params }: Props) => {
  const { id } = await params;
  const metadata = await generateMetadata({ params });

  if (!metadata) {
    return <h1>{id}</h1>;
  }

  const postUrl = `https://hey.xyz/posts/${metadata.other?.["lens:id"]}`;

  logger.info(`[OG] Fetched publication /posts/${metadata.other?.["lens:id"]}`);

  return (
    <>
      <h1>{metadata.title?.toString()}</h1>
      <h2>{metadata.description?.toString()}</h2>
      <div>
        <b>Stats</b>
        <ul>
          <li>
            <a href={postUrl}>Actions: {metadata.other?.["count:actions"]}</a>
          </li>
          <li>Comments: {metadata.other?.["count:comments"]}</li>
          <li>
            <a href={postUrl}>Likes: {metadata.other?.["count:likes"]}</a>
          </li>
          <li>
            <a href={postUrl}>Mirrors: {metadata.other?.["count:mirrors"]}</a>
          </li>
          <li>
            <a href={`${postUrl}/quotes`}>
              Quotes: {metadata.other?.["count:quotes"]}
            </a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Page;
