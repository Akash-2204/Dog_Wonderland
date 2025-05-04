import React, { useState, useEffect, useMemo, Fragment } from "react";
import {
  searchDogs,
  getBreeds,
  matchDogs,
  getDogsByIds,
  logout,
} from "../../services/api";
import { Dog, DogSearchQueryParams } from "../../types/models";
import { useRouter } from "next/navigation";
import DogCard from "../Card/Card";
import styles from "./Dashboard.module.scss";
import { Listbox, Transition, Dialog } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useUIStore, triggerLogout } from "@/stores/uiStore";
import Image from "next/image";

const Dashboard = () => {
  const isLoggedIn = useUIStore((state) => state.isLoggedIn);
  const router = useRouter();

  const [allFilteredDogs, setAllFilteredDogs] = useState<Dog[]>([]);
  const [breeds, setBreeds] = useState<string[]>([]);
  const [selectedBreed, setSelectedBreed] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [isLoadingBreeds, setIsLoadingBreeds] = useState(true);
  const [isLoadingMatchDetails, setIsLoadingMatchDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchedDogDetails, setMatchedDogDetails] = useState<Dog | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const pageSizes = [10, 20, 50, 100];

  useEffect(() => {
    const fetchBreedsData = async () => {
      setIsLoadingBreeds(true);
      try {
        const fetchedBreeds = await getBreeds();
        setBreeds(fetchedBreeds);
      } catch (error) { console.error("Failed to fetch breeds:", error); }
      finally { setIsLoadingBreeds(false); }
    };
    fetchBreedsData();
  }, []);

  useEffect(() => {
    if (!isLoadingBreeds && !isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn, isLoadingBreeds, router]);

  const totalResults = allFilteredDogs.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  const dogsToDisplay = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allFilteredDogs.slice(startIndex, endIndex);
  }, [allFilteredDogs, currentPage, pageSize]);

  if (!isLoggedIn) {
    return <p>Redirecting to login...</p>;
  }

  const handleSearch = async () => {
    setAllFilteredDogs([]);
    setCurrentPage(1);
    const queryParams: DogSearchQueryParams = {
      breeds: selectedBreed ? [selectedBreed] : undefined,
      sort: "breed:asc",
    };
    setIsLoadingSearch(true);
    try {
      const { resultIds } = await searchDogs(queryParams);
      if (resultIds && resultIds.length > 0) {
        const fetchedDogs = await getDogsByIds(resultIds);
        setAllFilteredDogs(fetchedDogs);
      } else { setAllFilteredDogs([]); }
    } catch (error) { console.error("Failed to search or fetch dogs:", error); setAllFilteredDogs([]); }
    finally { setIsLoadingSearch(false); }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleNextPage = () => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  const handlePrevPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));

  const handleMatch = async () => {
    if (favorites.size === 0) {
      alert("Please add dogs to favorites first!"); return;
    }
    setIsLoadingMatch(true);
    setMatchedDogDetails(null);
    setIsModalOpen(false);
    setIsLoadingMatchDetails(false);

    try {
      const { match: matchedDogId } = await matchDogs(Array.from(favorites));
      if (matchedDogId) {
        setIsLoadingMatchDetails(true);
        try {
          const dogDetailsArray = await getDogsByIds([matchedDogId]);
          if (dogDetailsArray && dogDetailsArray.length > 0) {
            setMatchedDogDetails(dogDetailsArray[0]);
            setIsModalOpen(true);
          } else {
            console.error("Could not fetch details for matched dog ID:", matchedDogId);
            alert("Could not fetch details for your matched dog.");
          }
        } catch (detailsError) {
           console.error("Failed to fetch matched dog details:", detailsError);
           alert("An error occurred while fetching match details.");
        } finally {
            setIsLoadingMatchDetails(false);
        }
      } else {
          alert("Sorry, couldn't find a match based on your favorites.");
      }
    } catch (error) {
      console.error("Failed to match dogs:", error);
      alert("An error occurred during the matching process.");
    } finally {
      setIsLoadingMatch(false);
    }
  };

  const toggleFavorite = (dogId: string) => {
    setFavorites((prevFavorites) => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(dogId)) { newFavorites.delete(dogId); }
      else { newFavorites.add(dogId); }
      return newFavorites;
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      triggerLogout();
      router.push("/");
    } catch(error) {
        console.error("Logout API call failed:", error);
        triggerLogout();
        router.push("/");
    }
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setMatchedDogDetails(null);
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dog Finder Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton} title="Logout">
            <ArrowLeftOnRectangleIcon className={styles.logoutButtonIcon} />
            <span className={styles.logoutButtonText}>Logout</span>
        </button>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.selectControl}>
          <Listbox value={selectedBreed} onChange={(value) => { setSelectedBreed(value); setCurrentPage(1); }} name="breed">
            {({}) => (
              <div>
                <Listbox.Label className={styles.searchLabel}>Filter by Breed:</Listbox.Label>
                <div className={styles.listboxWrapper}>
                  <Listbox.Button className={styles.listboxButton} disabled={isLoadingBreeds || isLoadingSearch}>
                    <span className={styles.listboxButtonText}>{selectedBreed ?? "Select a breed..."}</span>
                    <ChevronUpDownIcon className={styles.listboxButtonIcon} aria-hidden="true" />
                  </Listbox.Button>
                  <Transition as={Fragment} leave={styles.transitionLeave} leaveFrom={styles.transitionLeaveFrom} leaveTo={styles.transitionLeaveTo}>
                    <Listbox.Options className={styles.listboxOptions}>
                      {isLoadingBreeds ? ( <div className={styles.listboxOptionDisabled}>Loading breeds...</div> )
                       : breeds.length === 0 ? ( <div className={styles.listboxOptionDisabled}>No breeds available</div> )
                       : ( breeds.map((breed) => (
                          <Listbox.Option key={breed} className={({ active }) => `${styles.listboxOption} ${active ? styles.listboxOptionActive : ""}`} value={breed}>
                            {({ selected }) => (
                              <>
                                <span className={`${styles.listboxOptionText} ${selected ? styles.listboxOptionSelectedText : ""}`}>{breed}</span>
                                {selected ? (<span className={styles.listboxOptionCheck}><CheckIcon className={styles.listboxOptionCheckIcon} aria-hidden="true" /></span>) : null}
                              </>
                            )}
                          </Listbox.Option>
                        )))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </div>
            )}
          </Listbox>
        </div>
        <button onClick={handleSearch} className={styles.searchButton} disabled={isLoadingSearch || isLoadingBreeds}>
          {isLoadingSearch ? "Searching..." : "Search Dogs"}
        </button>
      </div>

      <div className={styles.resultsSection}>
        <h2 className={styles.resultsTitle}>Search Results</h2>
        {isLoadingSearch && <p>Loading dog results...</p>}
        {!isLoadingSearch && totalResults === 0 && (<p>No dogs found matching your criteria. Try selecting a different breed!</p>)}
        {dogsToDisplay.length > 0 && (
          <div className={styles.dogGrid}>
            {dogsToDisplay.map((dog) => (
              <DogCard key={dog.id} dog={dog} isFavorite={favorites.has(dog.id)} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        )}
      </div>

      {totalResults > 0 && (
        <div className={styles.paginationControls}>
           <div className={styles.pageSizeSelector}>
            <label htmlFor="page-size-select">Items per page:</label>
            <select id="page-size-select" value={pageSize} onChange={handlePageSizeChange} disabled={isLoadingSearch} className={styles.pageSizeSelectInput}>
              {pageSizes.map((size) => (<option key={size} value={size}>{size}</option>))}
            </select>
          </div>
          <span className={styles.resultsInfo}>Page {currentPage} of {totalPages} ({totalResults} total dogs)</span>
          <div className={styles.navigationButtons}>
            <button onClick={handlePrevPage} disabled={currentPage === 1 || isLoadingSearch} className={styles.paginationButton} aria-label="Previous page">&lt; Previous</button>
            <button onClick={handleNextPage} disabled={currentPage === totalPages || isLoadingSearch} className={styles.paginationButton} aria-label="Next page">Next &gt;</button>
          </div>
        </div>
      )}

      <div className={styles.actionButtons}>
        <button onClick={handleMatch} className={styles.matchButton} disabled={favorites.size === 0 || isLoadingMatch || isLoadingMatchDetails}>
          {isLoadingMatch ? "Matching..." : isLoadingMatchDetails ? "Loading Match..." : `Find Match (${favorites.size} Favorites)`}
        </button>
      </div>

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className={styles.modal} onClose={closeModal}>
           <Transition.Child
             as={Fragment}
             enter={styles.modalBackdropEnter}
             enterFrom={styles.modalBackdropEnterFrom}
             enterTo={styles.modalBackdropEnterTo}
             leave={styles.modalBackdropLeave}
             leaveFrom={styles.modalBackdropLeaveFrom}
             leaveTo={styles.modalBackdropLeaveTo}
           >
             <div className={styles.modalBackdrop} />
           </Transition.Child>

           <div className={styles.modalScrollContainer}>
             <div className={styles.modalContentContainer}>
               <Transition.Child
                 as={Fragment}
                 enter={styles.modalPanelEnter}
                 enterFrom={styles.modalPanelEnterFrom}
                 enterTo={styles.modalPanelEnterTo}
                 leave={styles.modalPanelLeave}
                 leaveFrom={styles.modalPanelLeaveFrom}
                 leaveTo={styles.modalPanelLeaveTo}
               >
                 <Dialog.Panel className={styles.modalPanel}>
                   <Dialog.Title as="h3" className={styles.modalTitle}>
                     Your Perfect Match!
                   </Dialog.Title>

                    <button onClick={closeModal} className={styles.modalCloseButton} aria-label="Close modal">
                        <XMarkIcon />
                    </button>

                   {matchedDogDetails ? (
                     <div className={styles.modalDogDetails}>
                       <div className={styles.modalImageContainer}>
                           <Image
                               src={matchedDogDetails.img}
                               alt={`Photo of ${matchedDogDetails.name}`}
                               fill
                               sizes="(max-width: 768px) 90vw, 500px"
                               style={{ objectFit: 'cover' }}
                               onError={(e) => { e.currentTarget.style.display = 'none'; }}
                           />
                       </div>
                       <h4>{matchedDogDetails.name}</h4>
                       <p><strong>Age:</strong> {matchedDogDetails.age} years</p>
                       <p><strong>Breed:</strong> {matchedDogDetails.breed}</p>
                       <p><strong>Zip Code:</strong> {matchedDogDetails.zip_code}</p>
                     </div>
                   ) : (
                     <p>Loading dog details...</p>
                   )}

                   <div className={styles.modalActions}>
                     <button type="button" className={styles.modalOkButton} onClick={closeModal}>
                       Awesome!
                     </button>
                   </div>
                 </Dialog.Panel>
               </Transition.Child>
             </div>
           </div>
         </Dialog>
       </Transition>

    </div>
  );
};

export default Dashboard;
