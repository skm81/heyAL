import { MenuItem } from "@headlessui/react";
import { Leafwatch } from "@helpers/leafwatch";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { PUBLICATION } from "@hey/data/tracking";
import getPublicationData from "@hey/helpers/getPublicationData";
import stopEventPropagation from "@hey/helpers/stopEventPropagation";
import type { MirrorablePublication } from "@hey/lens";
import cn from "@hey/ui/cn";
import type { FC } from "react";
import toast from "react-hot-toast";

interface CopyPostTextProps {
  publication: MirrorablePublication;
}

const CopyPostText: FC<CopyPostTextProps> = ({ publication }) => {
  const publicationType = publication.__typename;
  const filteredContent =
    getPublicationData(publication.metadata)?.content || "";

  return (
    <MenuItem
      as="div"
      className={({ focus }) =>
        cn(
          { "dropdown-active": focus },
          "m-2 block cursor-pointer rounded-lg px-2 py-1.5 text-sm"
        )
      }
      onClick={async (event) => {
        stopEventPropagation(event);
        await navigator.clipboard.writeText(filteredContent || "");
        toast.success("Content copied to clipboard!");
        Leafwatch.track(PUBLICATION.COPY_TEXT, {
          publication_id: publication.id
        });
      }}
    >
      <div className="flex items-center space-x-2">
        <ClipboardDocumentIcon className="size-4" />
        <div>
          {publicationType === "Comment"
            ? "Copy comment text"
            : "Copy post text"}
        </div>
      </div>
    </MenuItem>
  );
};

export default CopyPostText;
