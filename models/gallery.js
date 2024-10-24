import { Schema, model } from 'mongoose';

const schema = new Schema({
  collectionId: { type: String },
  name: { type: String },
  numberOfPhotos: { type: Number },
  eventDate: { type: Date },
  eventCategory: { type: String },
  clientsSynced: { type: Boolean },
  allGalleriesSynced: { type: Boolean },
  gallerySetsSynced: { type: Boolean }
}, {
  timestamps: true,
  strict: false
});

const Gallery = model('Gallery', schema, 'Galleries');

export default Gallery;
