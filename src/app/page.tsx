// src/app/page.tsx

"use client"; // Still needed for the page itself if it uses client features directly

import React from 'react';
import dynamic from 'next/dynamic';
import styles from './loginPage.module.scss'; 
import clsx from 'clsx';

// Dynamically import LoginComponent, disabling SSR for it
const LoginComponent = dynamic(
  () => import('../components/Login/Login'),
  {
    ssr: false, 
    loading: () => <p>Loading login form...</p> 
  }
);



const RootPage = () => {
  return (
    <>
      
      <main className={styles.container}>

        <div className={clsx(styles.blob, styles.blob1)}></div>
        <div className={clsx(styles.blob, styles.blob2)}></div>
        <div className={clsx(styles.blob, styles.blob3)}></div>


        <div className={styles.contentWrapper}>


          <h1 className={styles.title}>
            Dogs Wonderland
          </h1>


          <LoginComponent />

        </div>
      </main>
    </>
  );
};

export default RootPage;
