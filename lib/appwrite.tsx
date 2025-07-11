import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Account, Avatars, Client, Databases, OAuthProvider, Query } from "react-native-appwrite";

// Appwrite configuration

export const config = {
    platform: 'com.estate.propvista',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    galleriesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
    reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
    agentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
    propertiesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID,
}

// Create Appwrite client

export const client = new Client();

client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!)

// Export helpers

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);

// Login with Google OAuth

export async function login() {
    try {
        const redirectUri = Linking.createURL('/');
        const response = await account.createOAuth2Token(OAuthProvider.Google, redirectUri);

        if (!response) throw new Error('Failed to Login');

        const browserResult = await WebBrowser.openAuthSessionAsync(
            response.toString(),
            redirectUri
        )
        if (browserResult.type != 'success') throw new Error('Failed to Login');

        const url = new URL(browserResult.url);

        const secret = url.searchParams.get('secret')?.toString();
        const userId = url.searchParams.get('userId')?.toString();

        if(!secret || !userId) throw new Error('Failed to Login');

        const session = await account.createSession(userId, secret);
        if(!session) throw new Error('Failed to create new session');
        return true;

    }catch (error) {
        console.error("Login Error!!", error);
        return false;
    }
}
// Logout

export async function logout() {
    try {
        await account.deleteSession('current');
        return true;
    
    }catch (error){
        console.error("Logout Error!!", error);
        return false;
    }
}

// Get Current user

export async function getCurrentUser() {
  try {
    const response = await account.get();

    if (response?.$id) {
      const initialsUrl = `https://cloud.appwrite.io/v1/avatars/initials?name=${encodeURIComponent(
        response.name
      )}&width=200&height=200&output=png`;

      return {
        ...response,
        avatar: initialsUrl,
      };
    }
  } catch (error) {
    console.error("GetCurrentUser Error:", error);
    return null;
  }
}

// Get Properties

export async function getLatestProperties() {
  try {
    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      [Query.orderAsc("$createdAt"), Query.limit(5)]
    );

    return result.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getProperties({
  filter,
  query,
  limit,
}: {
  filter: string;
  query: string;
  limit?: number;
}) {
  try {
    const buildQuery = [Query.orderDesc("$createdAt")];

    if (filter && filter !== "All")
      buildQuery.push(Query.equal("types", filter));

    if (query)
      buildQuery.push(
        Query.or([
          Query.search("name", query),
          Query.search("address", query),
          Query.search("types", query),
        ])
      );

    if (limit) buildQuery.push(Query.limit(limit));

    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      buildQuery
    );

    return result.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// write function to get property by id

export async function getPropertyById({ id }: { id: string }) {
  try {
    const result = await databases.getDocument(
      config.databaseId!,
      config.propertiesCollectionId!,
      id
    );
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}
