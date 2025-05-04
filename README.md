# Dog Finder Dashboard - Application Documentation

## 1. Introduction

The Dog Finder Dashboard is a web application designed to help users find dogs available for adoption. Users can log in, search for dogs based on specific breeds, view dog details, mark their favorites, and find a potential "perfect match" from their selected favorites. The application features a modern, responsive user interface styled with SCSS Modules.

## 2. Features

* **Authentication:** Secure login required to access the main dashboard features. Login status is managed globally.
* **Breed Filtering:** Users can filter the displayed dogs by selecting a specific breed from a dynamically loaded list.
* **Dog Card Display:** Search results are presented in a responsive grid layout using interactive cards.
    * Each card initially shows the dog's picture and name.
    * Cards can be expanded to reveal more details (Age, Breed, Zip Code).
    * Cards include a button to add/remove the dog from the user's favorites.
* **Favorites System:** Users can mark dogs as favorites.
* **Matching Feature:** Users can request a "match" based on their list of favorite dogs. The matched dog's details are displayed in a modal.
* **Pagination:** Search results are paginated on the frontend, allowing users to browse through dogs using "Next" and "Previous" buttons and select the number of dogs displayed per page (10, 20, 50, 100).
* **Responsive Design:** The application layout and components adapt to different screen sizes (mobile, tablet, desktop).
* **Modal Dialog:** Used to display the details of the matched dog, featuring a blurred background effect.
* **Error Handling:** API errors are caught, and user-friendly messages are displayed via a snackbar notification system (managed globally).
* **Logout:** Users can securely log out of the application.

## 3. Project Structure (Simplified)

The project follows a standard Next.js (App Router) structure:

* `src/app/`: Contains the application's pages (routes).
    * `page.tsx`: The root route, serves as the Login Page.
    * `dashboard/page.tsx`: The `/dashboard` route, displays the main application dashboard.
    * `layout.tsx`: The root layout for the application.
    * `globals.css`: Global CSS styles (minimal, as SCSS Modules are used).
    * `LoginPage.module.scss`: Styles specific to the Login Page background/layout.
* `src/components/`: Reusable UI components.
    * `LoginComponent/`: Contains `LoginComponent.tsx` and `LoginComponent.module.scss`.
    * `Dashboard/`: Contains `Dashboard.tsx` and `Dashboard.module.scss`.
    * `Card/`: Contains `Card.tsx` (the Dog Card component) and `Card.module.scss`.
    * `Snackbar/`: (If implemented) Contains the `Snackbar.tsx` component.
* `src/services/`: Handles communication with the external API.
    * `api.ts`: Contains functions for all API calls (`login`, `logout`, `getBreeds`, `searchDogs`, `getDogsByIds`, `matchDogs`) and the `handleFetch` wrapper for common logic and error handling.
* `src/stores/`: Global state management using Zustand.
    * `uiStore.ts`: Defines the global state, including login status (`isLoggedIn`) and snackbar messages.
* `src/types/`: TypeScript type definitions.
    * `models.ts`: Contains interfaces for `Dog`, API responses, etc.

## 4. Setup and Installation

**(Assuming a standard Node.js environment)**

1.  **Prerequisites:** Node.js (LTS recommended) and npm or yarn installed.
2.  **Clone Repository:** `git clone <repository-url>`
3.  **Navigate to Directory:** `cd <project-directory>`
4.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
5.  **Run Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
6.  **Access Application:** Open your browser and navigate to `http://localhost:3000` (or the specified port).

## 5. Core Components

* **`src/app/page.tsx` (Login Page):**
    * Serves as the application's entry point (`/`).
    * Displays the "Dogs Wonderland" title and the futuristic gradient background.
    * Dynamically imports and renders the `LoginComponent` to handle user login.
* **`src/app/dashboard/page.tsx` (Dashboard Page):**
    * Handles the `/dashboard` route.
    * Checks if the user is logged in using the `useUIStore`. Redirects to the login page (`/`) if not logged in.
    * Renders the main `Dashboard` component.
* **`LoginComponent` (`src/components/LoginComponent/`):**
    * Provides the login form (Name, Email).
    * Includes client-side validation for inputs.
    * Calls the `login` API function on submission.
    * Updates the global `isLoggedIn` state via `triggerLogin()` on success.
    * Redirects the user to `/dashboard` upon successful login using `next/navigation`'s `useRouter`.
    * Styled using `LoginComponent.module.scss`.
* **`Dashboard` (`src/components/Dashboard/`):**
    * The main application view after login.
    * Fetches the list of available dog breeds on mount.
    * Displays the breed filter using a Headless UI `Listbox` (single select).
    * Contains the "Search Dogs" button to trigger fetching dogs based on selected filters.
    * Fetches *all* dog IDs matching the criteria and then fetches their details (frontend pagination strategy).
    * Manages the frontend pagination state (`currentPage`, `pageSize`).
    * Calculates the `dogsToDisplay` slice based on pagination state.
    * Renders the `DogCard` components in a responsive grid (`.dogGrid`).
    * Displays pagination controls (Page size selector, Previous/Next buttons).
    * Manages the `favorites` state (a `Set` of dog IDs).
    * Provides the "Find Match" button, which calls the `matchDogs` API and displays the result in a modal.
    * Provides the "Logout" button in the header.
    * Handles loading states for various asynchronous operations.
    * Styled using `Dashboard.module.scss`.
* **`DogCard` (`src/components/Card/`):**
    * Displays information for a single dog.
    * Uses `next/image` for optimized image display.
    * Manages its own expanded/collapsed state (`isExpanded`).
    * Initially shows only the dog's image and name.
    * Expands on click (or keyboard activation) to show Age, Breed, Zip Code, and the Favorite button.
    * Receives `isFavorite` status and `onToggleFavorite` function as props from the `Dashboard`.
    * Styled using `Card.module.scss` with futuristic elements and hover effects.
* **`Snackbar` (`src/components/Snackbar/`):**
    * (If implemented globally) A simple component to display temporary messages (like API errors).
    * Its visibility and message content are likely controlled by the `uiStore`.

## 6. State Management (`uiStore`)

* Uses **Zustand** for simple global state management.
* **`isLoggedIn` (boolean):** Tracks whether the user is currently authenticated. Set to `true` by `triggerLogin()` after a successful API login, and `false` by `triggerLogout()`. Crucial for route protection.
* **`snackbarMessage` (string | null):** Holds the message to be displayed by the Snackbar. Set by `showSnackbar()` (called via `triggerErrorSnackbar`) and cleared by `hideSnackbar()`.

## 7. API Service (`api.ts`)

* Centralizes all interactions with the `https://frontend-take-home-service.fetch.com` API.
* **`handleFetch<T>`:** A wrapper function around the native `fetch` API.
    * Automatically includes `credentials: "include"` for sending cookies.
    * Sets default `Content-Type: application/json`.
    * Checks if `response.ok`.
    * If not OK, attempts to parse the error body (text or JSON), constructs an error message, triggers the global snackbar via `triggerErrorSnackbar`, and (importantly) **does not throw an error by default in the current version**, allowing the calling function to potentially continue (this might need review depending on desired behavior).
    * If OK, parses the JSON response or handles empty/non-JSON responses.
    * Catches network errors, triggers the snackbar, and re-throws the error.
* **Specific Functions:** Provides typed functions (`login`, `logout`, `getBreeds`, `searchDogs`, `getDogsByIds`, `matchDogs`, etc.) that call `handleFetch` with the correct endpoint, method, and body, returning typed promises.

## 8. Styling

* Uses **SCSS Modules** (`.module.scss`) for component-scoped styling. This prevents class name collisions.
* Leverages SCSS features like variables (`$`), nesting, and `@extend`.
* Includes responsive design using `@media` queries based on standard breakpoints (`sm`, `md`, `lg`).
* Dark mode support is implemented using `@media (prefers-color-scheme: dark)`.
* Styles aim for a modern, "futuristic" aesthetic with gradients, shadows, and potentially blur effects.

## 9. Usage Flow

1.  User visits the root URL (`/`) and sees the Login Page.
2.  User enters their Name and Email and clicks "Login".
3.  `LoginComponent` validates input and calls the `login` API.
4.  On success, the `isLoggedIn` state is set to `true` in the `uiStore`, and the user is redirected to `/dashboard`.
5.  `Dashboard` component mounts, checks `isLoggedIn`, and fetches the list of breeds.
6.  User selects a breed from the Listbox dropdown.
7.  User clicks "Search Dogs".
8.  `handleSearch` calls `searchDogs` API (without size/from) to get all matching IDs, then calls `getDogsByIds` to fetch details for all matches.
9.  The `allFilteredDogs` state is updated.
10. `dogsToDisplay` calculates the subset for the current page.
11. The grid displays `DogCard` components for the current page.
12. User can interact with cards:
    * Click to expand/collapse details.
    * Click the heart button to add/remove from favorites (updates `favorites` state).
13. User can use pagination controls (Previous/Next buttons, Page Size selector) to navigate through the `allFilteredDogs` list.
14. User clicks "Find Match".
15. `handleMatch` calls `matchDogs` API with favorite IDs.
16. If a match ID is returned, `getDogsByIds` fetches the matched dog's details.
17. The modal opens, displaying the matched dog's information.
18. User closes the modal.
19. User clicks the "Logout" button in the header.
20. `handleLogout` calls the `logout` API (if implemented), sets `isLoggedIn` to `false` via `triggerLogout()`, and redirects the user to the login page (`/`).

## 10. Future Enhancements (Optional)

* Implement API-based pagination if performance with frontend pagination becomes an issue or if the API's pagination is fixed/clarified.
* Add more robust error handling and user feedback beyond the snackbar.
* Implement the actual API call for the `logout` function.
* Persist `isLoggedIn` state using `localStorage` (via Zustand middleware) for a more seamless experience across browser sessions (while still relying on middleware/cookies for true security).
* Add loading skeletons for cards and other data sections.
* Implement functionality to display the matched dog's details more prominently after the modal is closed (e.g., highlighting the card).
* Add more search filters (age range, zip code radius).
* Refactor favorite button logic fully into the `DogCard` for better encapsulation.

