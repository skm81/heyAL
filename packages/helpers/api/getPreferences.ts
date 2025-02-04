import { HEY_API_URL } from "@hey/data/constants";
import type { Preferences } from "@hey/types/hey";
import axios from "axios";

export const GET_PREFERENCES_QUERY_KEY = "getPreferences";

/**
 * Get profile preferences
 * @param headers auth headers
 * @returns profile preferences
 */
const getPreferences = async (headers: any): Promise<Preferences> => {
  try {
    const { data } = await axios.get(`${HEY_API_URL}/preferences/get`, {
      headers
    });

    return data.result;
  } catch {
    return {
      appIcon: 0,
      email: null,
      emailVerified: false,
      hasDismissedOrMintedMembershipNft: true,
      highSignalNotificationFilter: false,
      developerMode: false,
      permissions: [],
      mutedWords: [],
      theme: null
    };
  }
};

export default getPreferences;
