import pkg from 'lodash';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { SaveGalleries, UpdateGallery, GetGalleries as GetGalleriesFromDb } from '../db-services/gallery.js';
import { SaveClients } from '../db-services/client.js';
import { GetGallerySets, SaveGallerySets, UpdateGallerySet } from '../db-services/gallery-set.js';
import { SaveGalleryPhotos, UpdateGalleryPhoto } from '../db-services/photo.js';

const { isEmpty } = pkg;

// sleep method to make the script wait for specified seconds
export const sleep = (secs = 1) => new Promise((resolve) => {
  setTimeout(resolve, secs * 1000);
});

export const getCookies = ({ cookies }) => {
  let cookieMerge = '';
  const cookieList = [];
  for (let i = 0; i < cookies.length; i += 1) {
    if (cookies[i].name !== 'sst-main') {
      const { name } = cookies[i];
      const { value } = cookies[i];
      cookieMerge = `${name}=${value}`;
      cookieList.push(cookieMerge);
    }
  }
  return cookieList.join(';');
};

const getGalleryCollections = async ({
  galleries,
  filteredCookies
}) => {
  console.log('in getGalleryCollections');
  const galleryCollections = [];
  for (let i = 0; i < galleries.length; i += 1) {
    const collection = galleries[i];
    // api call to get categories of each collection if exists
    const tagResponse = await axios({
      url: `https://galleries.pixieset.com/api/v1/collections/${collection.id}/edit`,
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        cookie: filteredCookies
      }
    });

    // create data with required fields
    galleryCollections.push({
      collectionId: collection.id,
      eventDate: collection.event_date,
      galleryName: collection.name,
      numberOfPhotos: collection.photo_count,
      categories: `${tagResponse.data?.distinctTags?.join(',') || ''}`
    });
  }

  return galleryCollections;
}

const GetGalleries = async ({ filteredCookies }) => {
  try {
    const [latestGallery] = await GetGalleriesFromDb({ limit: 1, sort: { createdAt: -1 } });
    let pageNumber;
    const { pageNumber: latestPageNumber = 0 } = latestGallery || {};
    console.log({ latestPageNumber });
    pageNumber = latestPageNumber + 1;
    const galleries = [];
    // api call to get client gallery collections
    const response = await axios({
      url: 'https://galleries.pixieset.com/api/v1/dashboard_listings?page=1',
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        cookie: filteredCookies
      },
      params: {
        page: pageNumber
      }
    });

    const { data } = response?.data || {};
    const { meta, data: galleriesData } = data || {};
    const { last_page: lastPage } = meta || {};
    const { collections } = galleriesData || {};

    let galleryCollections = await getGalleryCollections({ galleries: collections, filteredCookies });
    await SaveGalleries({ galleries: galleryCollections, pageNumber });

    galleries.push(...galleryCollections);

    // loop through all the pages
    while (lastPage !== pageNumber) {
      pageNumber += 1;
      console.log({ pageNumber })
      const response = await axios({
        url: 'https://galleries.pixieset.com/api/v1/dashboard_listings?page=1',
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          cookie: filteredCookies
        },
        params: {
          page: pageNumber
        }
      });

      const { data } = response?.data || {};
      const { data: galleriesData } = data || {};
      const { collections } = galleriesData || {};

      galleryCollections = await getGalleryCollections({ galleries: collections, filteredCookies });

      await SaveGalleries({ galleries: galleryCollections, pageNumber });

      galleries.push(...galleryCollections);
    }

    await UpdateGallery({
      filterParams: {
        collectionId: galleries[galleries.length - 1]?.collectionId
      },
      updateParams: {
        allGalleriesSynced: true
      }
    });

    // header for Galleries.csv
    const header = 'Gallery Name,Number of Photos,Event Date,Event Category\n';

    // generate rows with the data
    const csvRows = galleries.map(({ galleryName, numberOfPhotos, eventDate, categories }) => {
      return `${galleryName},${numberOfPhotos},${eventDate},${categories || ''}`;
    }).join('\n');

    const csvData = header + csvRows;

    const outputPath = path.join(process.cwd(), 'Galleries.csv');

    // write file
    fs.writeFile(outputPath, csvData, (err) => {
      if (err) {
        console.error('Error writing to CSV file:', err);
      } else {
        console.log('CSV file was successfully written to:', outputPath);
      }
    });

    return galleries;
  } catch (err) {
    console.log('Error in GetGalleries method', err);
    throw err;
  }
};

const GetClients = async ({ page, filteredCookies }) => {
  try {
    let collections = [];
    // call this method to get the collections from client gallery
    const [gallery] = await GetGalleriesFromDb({ filterParams: { allGalleriesSynced: true }, limit: 1 });
    if (gallery) {
      collections = await GetGalleriesFromDb({ filterParams: { clientsSynced: { $exists: false } } });
      console.log({
        collectionsFromDb: collections.length
      });
    } else {
      collections = await GetGalleries({ filteredCookies });
    }

    console.log({ collections: collections.length });

    const clientsData = [];

    for (let i = 0; i < collections.length; i += 1) {
      const collection = collections[i];
      console.log('Collection:', collection.collectionId);
      await page.goto(`https://galleries.pixieset.com/collections/${collection.collectionId}`);
      // api to get clients data for each collection
      const response = await axios({
        url: `https://galleries.pixieset.com/api/v1/collections/${collection.collectionId}/invite_history`,
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          cookie: filteredCookies
        }
      });

      const { data } = response?.data;

      // create data with required fields
      const clients = data.map((client) => ({
        collectionId: collection.collectionId,
        galleryName: collection.galleryName,
        clientName: client.name || '',
        clientEmail: client.email
      }));

      await SaveClients({ clients });

      await UpdateGallery({
        filterParams: {
          collectionId: collection.collectionId
        },
        updateParams: {
          clientsSynced: true
        }
      });

      clientsData.push(...clients);
    }

    console.log({
      clientsData: clientsData.length
    });

    if (clientsData.length) {
      // header for Galleries.csv
      const header = 'Gallery Name,Client Name,Client Email\n';

      // generate rows with the data
      const csvRows = clientsData.map((client) => {
        const {
          galleryName = '',
          clientName = '',
          clientEmail = ''
        } = client || {};

        return `${galleryName},${clientName},${clientEmail}`;
      }).join('\n');

      const csvData = header + csvRows;

      const outputPath = path.join(process.cwd(), 'Clients.csv');

      // write file
      fs.writeFile(outputPath, csvData, (err) => {
        if (err) {
          console.error('Error writing to CSV file:', err);
        } else {
          console.log('CSV file was successfully written to:', outputPath);
        }
      });
    }

    // call this method to generate Photos.csv
    await GetGalleryPhotos({
      page,
      filteredCookies,
      collections,
      galleriesSynced: !isEmpty(gallery)
    });
    return true;
  } catch (err) {
    console.log('Error in GetClients method', err);
    throw err;
  }
};

export const GetGalleryPhotos = async ({
  page,
  filteredCookies,
  collections,
  galleriesSynced
}) => {
  try {
    console.log({
      galleriesSynced
    });
    let gallerySets = [];
    let collections = [];
    // call this method to get the collections from client gallery
    const photosData = [];

    collections = await GetGalleriesFromDb({ filterParams: { gallerySetsSynced: { $exists: false } } });

    console.log({
      collectionsInGetPhotos: collections.length
    })

    await page.goto('https://galleries.pixieset.com/collections');

    for (let i = 0; i < collections.length; i += 1) {
      const collection = collections[i];
      console.log('Get Gallery set for', collection.collectionId);
      // api call to get collection's sets
      const response = await axios({
        url: `https://galleries.pixieset.com/api/v1/collections/${collection.collectionId}/galleries`,
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          cookie: filteredCookies
        }
      });

      let { data } = response?.data;

      gallerySets = data;


      await SaveGallerySets({ gallerySets, galleryName: collection.name });

      await UpdateGallery({
        filterParams: {
          collectionId: collection.collectionId
        },
        updateParams: {
          gallerySetsSynced: true
        }
      });

      console.log('Gallery Sets Saved!');
    }

    gallerySets = await GetGallerySets({
      filterParams: {
        photosSynced: { $exists: false }
      }
    });

    console.log({
      nonSyncedGallerySets: gallerySets.length
    });

    // loop through each set
    for (let j = 0; j < gallerySets.length; j += 1) {
      const set = gallerySets[j];

      // api call to get photos and videos in each set
      const response = await axios({
        url: `https://galleries.pixieset.com/api/v1/galleries/${set.setId}?expand=photos.starred%2Cvideos`,
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          cookie: filteredCookies
        }
      });

      const { data: { photos = [] } } = response?.data || {};

      // create data with required fields
      const gallerySetPhotos = photos.map((photo) => ({
        collectionId: set.collectionId,
        setId: set.setId,
        galleryName: set.galleryName || '',
        photoId: photo.id || '',
        photoUrl: photo.path_xxlarge || '',
        xLarge: photo.path_xlarge || '',
        large: photo.path_large || '',
        medium: photo.path_medium || '',
        thumb: photo.path_thumb || '',
        displaySmall: photo.path_display_small || '',
        displayMedium: photo.path_display_medium || '',
        displayLarge: photo.path_display_large || ''
      }));

      photosData.push(...gallerySetPhotos);

      await SaveGalleryPhotos({ photos: gallerySetPhotos, setName: set.name });

      await UpdateGallerySet({
        filterParams: {
          collectionId: set.collectionId,
          setId: set.setId
        },
        updateParams: {
          photosSynced: true
        }
      });
    }

    if (photosData.length) {
      // header for Photos.csv
      const header = 'Gallery Name,Photo Id,Photo Url,X Large,Large,Medium,Thumb,Display Small,Display Medium,Display Large\n';

      // generate rows with the data
      const csvRows = photosData.map((photo) => {
        const {
          galleryName,
          photoId,
          photoUrl,
          xLarge,
          large,
          medium,
          thumb,
          displaySmall,
          displayMedium,
          displayLarge
        } = photo || {};

        return `${galleryName},${photoId},` +
          `${photoUrl ? 'https:' + photoUrl : ''},` +
          `${xLarge ? 'https:' + xLarge : ''},` +
          `${large ? 'https:' + large : ''},` +
          `${medium ? 'https:' + medium : ''},` +
          `${thumb ? 'https:' + thumb : ''},` +
          `${displaySmall ? 'https:' + displaySmall : ''},` +
          `${displayMedium ? 'https:' + displayMedium : ''},` +
          `${displayLarge ? 'https:' + displayLarge : ''}`;
      }).join('\n');


      const csvData = header + csvRows;

      const outputPath = path.join(process.cwd(), 'Photos.csv');

      // write file
      fs.writeFile(outputPath, csvData, (err) => {
        if (err) {
          console.error('Error writing to CSV file:', err);
        } else {
          console.log('CSV file was successfully written to:', outputPath);
        }
      });
    }

    return true;
  } catch (err) {
    console.log('Error in GetGalleryPhotos method', err);
    throw err;
  }
}
export default GetClients;
