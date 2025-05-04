import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronDownIcon, HeartIcon as HeartOutline } from '@heroicons/react/24/outline'; 
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'; 
import clsx from 'clsx'; 

import styles from './Card.module.scss'; 
import { Dog } from '@/types/models';



interface DogCardProps {
    dog: Dog;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
}

const Card: React.FC<DogCardProps> = ({ dog, isFavorite, onToggleFavorite }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = (e: React.MouseEvent | React.KeyboardEvent) => {
        if ((e.target as HTMLElement).closest(`.${styles.favoriteButton}`)) {
            return;
        }
        setIsExpanded(!isExpanded);
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        onToggleFavorite(dog.id);
    };

     const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
             if (!(e.target as HTMLElement).classList.contains(styles.favoriteButton)) {
                 toggleExpand(e);
             }
        }
    };


    return (
        <div
            className={clsx(styles.card, isExpanded && styles.expanded)}
            onClick={toggleExpand}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-expanded={isExpanded}
        >
            <div className={styles.imageContainer}>
                <Image
                    src={dog.img}
                    alt={`Photo of ${dog.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    priority
                    onError={(e) => {
                        console.error(`Failed to load image for ${dog.name}: ${dog.img}`);
                        const target = e.target as HTMLImageElement;
                        if (target.parentElement) {
                             target.parentElement.style.backgroundColor = '#333';
                             target.style.display = 'none';
                        }
                    }}
                />
            </div>

            <div className={styles.contentArea}>
                <div className={styles.header}>
                    <h3 className={styles.dogName}>{dog.name}</h3>
                    <div className={styles.toggleIndicator}>
                        <span className={styles.toggleText}>
                            {isExpanded ? 'Collapse' : 'Expand'}
                        </span>
                        <ChevronDownIcon className={styles.arrowIcon} />
                    </div>
                </div>

                <div className={styles.details}>
                    <p><strong>Age:</strong> {dog.age} years</p>
                    <p><strong>Breed:</strong> {dog.breed}</p>
                    <p><strong>Zip Code:</strong> {dog.zip_code}</p>

                    <button
                        className={clsx(styles.favoriteButton, isFavorite && styles.isFavorite)}
                        onClick={handleFavoriteClick}
                        aria-pressed={isFavorite}
                        title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    >
                        {isFavorite ? (
                            <HeartSolid className={styles.favoriteIcon} />
                        ) : (
                            <HeartOutline className={styles.favoriteIcon} />
                        )}
                        <span className={styles.favoriteButtonText}>
                            {isFavorite ? 'Favorite' : 'Add Favorite'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};


export default Card;

