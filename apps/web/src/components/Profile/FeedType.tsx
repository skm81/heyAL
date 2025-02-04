import { Leafwatch } from "@helpers/leafwatch";
import {
  ChatBubbleLeftIcon,
  FilmIcon,
  ListBulletIcon,
  PencilSquareIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";
import { ProfileFeedType } from "@hey/data/enums";
import { PROFILE } from "@hey/data/tracking";
import { TabButton } from "@hey/ui";
import type { Dispatch, FC, SetStateAction } from "react";
import MediaFilter from "./Filters/MediaFilter";

interface FeedTypeProps {
  feedType: ProfileFeedType;
  setFeedType?: Dispatch<SetStateAction<ProfileFeedType>>;
}

const FeedType: FC<FeedTypeProps> = ({ feedType, setFeedType }) => {
  const switchTab = (type: ProfileFeedType) => {
    if (setFeedType) {
      setFeedType(type);
    }
    Leafwatch.track(PROFILE.SWITCH_PROFILE_FEED_TAB, {
      profile_feed_type: type.toLowerCase()
    });
  };

  const tabs = [
    {
      icon: <PencilSquareIcon className="size-4" />,
      name: "Feed",
      type: ProfileFeedType.Feed
    },
    {
      icon: <ChatBubbleLeftIcon className="size-4" />,
      name: "Replies",
      type: ProfileFeedType.Replies
    },
    {
      icon: <FilmIcon className="size-4" />,
      name: "Media",
      type: ProfileFeedType.Media
    },
    {
      icon: <ShoppingBagIcon className="size-4" />,
      name: "Collected",
      type: ProfileFeedType.Collects
    },
    {
      icon: <ListBulletIcon className="size-4" />,
      name: "Lists",
      type: ProfileFeedType.Lists
    }
  ].filter(
    (tab): tab is { icon: JSX.Element; name: string; type: ProfileFeedType } =>
      Boolean(tab)
  );

  return (
    <div className="flex items-center justify-between">
      <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-2 sm:mt-0 sm:px-0 md:pb-0">
        {tabs.map((tab) => (
          <TabButton
            active={feedType === tab.type}
            icon={tab.icon}
            key={tab.type}
            name={tab.name}
            onClick={() => switchTab(tab.type)}
            type={tab.type.toLowerCase()}
          />
        ))}
      </div>
      {feedType === ProfileFeedType.Media && <MediaFilter />}
    </div>
  );
};

export default FeedType;
