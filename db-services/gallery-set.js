import pkg from 'lodash';

import GallerySet from '../models/gallery-set.js';

import { sleep } from '../src/helpers/common.js';

import { PLATFORMS } from '../constants.js';

const { chunk } = pkg;

const SaveGallerySets = async ({
  gallerySets: gallerySetsData,
  galleryName,
  userEmail,
  platform
}) => {
  let collectionId;
  let setId;
  let numberOfPhotos;
  let name;
  let subsetIds;

  const gallerySetsChunks = chunk(gallerySetsData, 200);

  console.log({ gallerySetsChunks: gallerySetsChunks.length });


  for (let i = 0; i < gallerySetsChunks.length; i += 1) {
    const gallerySets = gallerySetsChunks[i];

    const writeData = gallerySets.map((set) => {
      if (platform === PLATFORMS.PIXIESET) {
        const {
          collection_id,
          id,
          photo_count,
          name: setName
        } = set;
  
        collectionId = collection_id;
        setId = id;
        numberOfPhotos = photo_count;
        name = setName
      } else if (platform === PLATFORMS.PIC_TIME) {
        const {
          galleryId,
          sceneId,
          name: setName
        } = set;
  
        collectionId = galleryId;
        setId = sceneId;
        name = setName
      } else if (platform === PLATFORMS.SHOOTPROOF) {
        const {
          photoCount,
          collectionId: galleryId,
          setId: id,
          subAlbumIds,
          name: setName
        } = set;
        collectionId = galleryId;
        setId = id;
        numberOfPhotos = photoCount;
        name = setName;
        subsetIds = subAlbumIds;
      } else if (platform === PLATFORMS.ZENFOLIO) {
        const {
          galleryId,
          setId: Id,
          name: setName,
          numberOfPhotos: photoCount,
        } = set;
        collectionId = galleryId;
        setId = Id;
        numberOfPhotos = photoCount;
        name = setName;
      }
  
      return {
        updateOne: {
          filter: {
            userEmail,
            collectionId,
            setId
          },
          update: {
            $set: {
              collectionId,
              galleryName,
              numberOfPhotos,
              name,
              platform,
              subsetIds
            }
          },
          upsert: true
        }
      }
    });
    if (writeData.length) {
      let retries = 3;
      while (retries > 0) {
        try {
          const res = await GallerySet.bulkWrite(writeData);
          console.log({ SaveGallerySets: res });
          break;
        } catch (err) {
          console.log('Error in Save Galleries Sets Bulk Write', err);
          retries -=1;

          if (retries === 0) {
            throw err;
          }
        
        console.log(`Retrying... attempts left: ${retries}`);

        await sleep(5);
      }
    }
  }
}};

const SaveZenFolioGallerySets = async ({
  gallerySets: gallerySetsData,
  galleryName,
  userEmail,
  platform
}) => {
  const gallerySetsChunks = chunk(gallerySetsData, 200);

  console.log({ gallerySetsChunks: gallerySetsChunks.length });


  for (let i = 0; i < gallerySetsChunks.length; i += 1) {
    const gallerySets = gallerySetsChunks[i];

    const writeData = gallerySets.map((set) => {
      const {
        galleryId: collectionId,
        setId,
        name,
        numberOfPhotos,
      } = set;

      return {
        updateOne: {
          filter: {
            userEmail,
            collectionId,
            setId
          },
          update: {
            $set: {
              numberOfPhotos,
              name,
              platform,
              galleryName
            }
          },
          upsert: true
        }
      }
    });
    if (writeData.length) {
      const res = await GallerySet.bulkWrite(writeData);
      console.log({ SaveGallerySets: res });
    }
  }
};

const UpdateGallerySet = async ({
  filterParams,
  updateParams,
  unsetParams
}) => {
  if (unsetParams) {
    await GallerySet.updateOne({
      ...filterParams
    }, {
      $set: updateParams,
      $unset: unsetParams
    });
  } else {
    await GallerySet.updateOne({
      ...filterParams
    }, {
      ...updateParams
    });
  }
};

const UpdateGallerySets = async ({
  filterParams,
  updateParams,
  unsetParams
}) => {
  if (unsetParams) {
    await GallerySet.updateMany({
      ...filterParams
    }, {
      $set: updateParams,
      $unset: unsetParams
    });
  } else {
    await GallerySet.updateMany({
      ...filterParams
    }, {
      ...updateParams
    });
  }
};


const GetGallerySets = async ({
  filterParams
}) => {
  const gallerySets = await GallerySet.find(filterParams);
  return gallerySets;
};


export {
  GetGallerySets,
  SaveGallerySets,
  SaveZenFolioGallerySets,
  UpdateGallerySet,
  UpdateGallerySets
};

