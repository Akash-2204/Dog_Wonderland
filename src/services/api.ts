import { triggerErrorSnackbar } from "../stores/uiStore";
import {
  Dog,
  Location,
  DogSearchResponse,
  LoginRequest,
  DogSearchQueryParams,
  MatchResponse,
  LocationSearchRequest,
  LocationSearchResponse,
} from "../types/models";

async function handleFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText || ''} on ${options?.method || 'GET'} ${url.split('?')[0]}`;
      let errorBodyText: string | null = null;
      try {
        errorBodyText = await response.text();
        if (errorBodyText) {
           const errorContentType = response.headers.get('content-type');
           let specificError = errorBodyText;

           if (errorContentType && errorContentType.includes('application/json')) {
               try {
                   const errorJson = JSON.parse(errorBodyText);
                   specificError = errorJson.message || errorJson.error || JSON.stringify(errorJson);
               } catch (jsonError) {
                   console.warn("API error response indicated JSON but failed to parse:", jsonError);
               }
           }

           if (!specificError.trim().startsWith('<') && specificError.length < 200) {
              errorMessage += ` - ${specificError}`;
           } else if (specificError.length >= 200) {
               errorMessage += ` - (Response body too large or is HTML)`;
           }
        }
      } catch (readError) {
        console.error("API Call Failed: Could not read error response body.", readError);
        errorMessage += " - (Could not read error response body)";
      }

      triggerErrorSnackbar(errorMessage);
      // Note: Original throw new Error(errorMessage) was commented out by user previously
      // If you want errors to stop execution flow in the calling component's catch block,
      // you might need to re-enable this throw. Currently, it only triggers the snackbar.
    }

    const contentType = response.headers.get("content-type");
    if (response.status === 204 || !contentType) {
         return undefined as T;
    }

    if (contentType.includes("application/json")) {
        return await response.json() as T;
    } else {
        console.warn(`API Success: Received non-JSON response with Content-Type: ${contentType}`);
        return undefined as T;
    }

  } catch (error) {
    const networkErrorMessage = error instanceof Error ? error.message : "A network error occurred.";
    console.error('Network or Fetch Error:', error);
    const finalNetworkError = `Network Error: ${networkErrorMessage} on ${options?.method || 'GET'} ${url.split('?')[0]}`;
    triggerErrorSnackbar(finalNetworkError);
    throw error;
  }
}


export async function login(request: LoginRequest): Promise<void> {
  await handleFetch<void>(
    "https://frontend-take-home-service.fetch.com/auth/login",
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
}

export async function logout(): Promise<void> {
  await handleFetch<void>(
    "https://frontend-take-home-service.fetch.com/auth/logout",
    {
      method: "POST",
    }
  );
}

export async function getBreeds(): Promise<string[]> {
  return await handleFetch<string[]>(
    "https://frontend-take-home-service.fetch.com/dogs/breeds"
  );
}

export async function searchDogs(
  queryParams: DogSearchQueryParams
): Promise<DogSearchResponse> {
  const queryStringParams = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
         queryStringParams.append(key, value.join(','));
      } else {
        queryStringParams.append(key, String(value));
      }
    }
  });

  const queryString = queryStringParams.toString();
  console.log("API Call URL:", `https://frontend-take-home-service.fetch.com/dogs/search?${queryString}`);

  const result = await handleFetch<DogSearchResponse>(
    `https://frontend-take-home-service.fetch.com/dogs/search?${queryString}`
  );

  return {
      resultIds: result?.resultIds ?? [],
      total: result?.total ?? 0,
      next: result?.next,
      prev: result?.prev,
  };
}

export async function getDogsByIds(ids: string[]): Promise<Dog[]> {
  const result = await handleFetch<Dog[]>(
    "https://frontend-take-home-service.fetch.com/dogs",
    {
      method: "POST",
      body: JSON.stringify(ids),
    }
  );
  return result ?? []; // Return empty array if result is undefined
}

export async function matchDogs(ids: string[]): Promise<MatchResponse> {
  const result = await handleFetch<MatchResponse>(
    "https://frontend-take-home-service.fetch.com/dogs/match",
    {
      method: "POST",
      body: JSON.stringify(ids),
    }
  );
   // Provide a default MatchResponse if result is undefined, adjust as needed
  return result ?? { match: '' };
}

export async function getLocationsByZipCodes(
  zipCodes: string[]
): Promise<Location[]> {
  const result = await handleFetch<Location[]>(
    "https://frontend-take-home-service.fetch.com/locations",
    {
      method: "POST",
      body: JSON.stringify(zipCodes),
    }
  );
   return result ?? []; // Return empty array if result is undefined
}

export async function searchLocations(
  request: LocationSearchRequest
): Promise<LocationSearchResponse> {
  const result = await handleFetch<LocationSearchResponse>(
    "https://frontend-take-home-service.fetch.com/locations/search",
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
  // Provide a default LocationSearchResponse if result is undefined
  return result ?? { results: [], total: 0 };
}
