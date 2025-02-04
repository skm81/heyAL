import ProfileListShimmer from "@components/Shared/Shimmer/ProfileListShimmer";
import SingleProfile from "@components/Shared/SingleProfile";
import { UsersIcon } from "@heroicons/react/24/outline";
import type { MutualFollowersRequest, Profile } from "@hey/lens";
import { LimitType, useMutualFollowersQuery } from "@hey/lens";
import { EmptyState, ErrorMessage } from "@hey/ui";
import type { FC } from "react";
import { Virtuoso } from "react-virtuoso";
import { useProfileStore } from "src/store/persisted/useProfileStore";

interface MutualFollowersListProps {
  handle: string;
  profileId: string;
}

const MutualFollowers: FC<MutualFollowersListProps> = ({
  handle,
  profileId
}) => {
  const { currentProfile } = useProfileStore();

  const request: MutualFollowersRequest = {
    limit: LimitType.TwentyFive,
    observer: currentProfile?.id,
    viewing: profileId
  };

  const { data, error, fetchMore, loading } = useMutualFollowersQuery({
    skip: !profileId,
    variables: { request }
  });

  const mutualFollowers = data?.mutualFollowers?.items;
  const pageInfo = data?.mutualFollowers?.pageInfo;
  const hasMore = pageInfo?.next;

  const onEndReached = async () => {
    if (hasMore) {
      await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next } }
      });
    }
  };

  if (loading) {
    return <ProfileListShimmer />;
  }

  if (mutualFollowers?.length === 0) {
    return (
      <EmptyState
        icon={<UsersIcon className="size-8" />}
        message={
          <div>
            <span className="mr-1 font-bold">{handle}</span>
            <span>doesn't have any mutual followers.</span>
          </div>
        }
        hideCard
      />
    );
  }

  if (error) {
    return (
      <ErrorMessage
        className="m-5"
        error={error}
        title="Failed to load mutual followers"
      />
    );
  }

  return (
    <Virtuoso
      className="virtual-profile-list"
      computeItemKey={(index, mutualFollower) =>
        `${mutualFollower.id}-${index}`
      }
      data={mutualFollowers}
      endReached={onEndReached}
      itemContent={(_, mutualFollower) => (
        <div className="p-5">
          <SingleProfile
            hideFollowButton={currentProfile?.id === mutualFollower.id}
            hideUnfollowButton={currentProfile?.id === mutualFollower.id}
            profile={mutualFollower as Profile}
            showBio
            showUserPreview={false}
          />
        </div>
      )}
    />
  );
};

export default MutualFollowers;
