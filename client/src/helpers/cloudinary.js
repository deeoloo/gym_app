// helpers/cloudinary.js

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const WORKOUTS_FOLDER = import.meta.env.VITE_CLOUDINARY_WORKOUTS_FOLDER;
const NUTRITION_FOLDER = import.meta.env.VITE_CLOUDINARY_NUTRITION_FOLDER;

const isUrl = (v = '') => /^https?:\/\//i.test(v);
const isCloudinaryUrl = (v = '') => v.includes('res.cloudinary.com');

const ensureFolder = (publicId, folder) => 
  publicId.includes('/') ? publicId : `${folder}/${publicId}`;

// image: f_auto,q_auto + sizing
export const cloudinaryImageURL = (src, opts = {}) => {
  const { w = 1200, h = 675, fit = 'fill' } = opts;
  const t = `f_auto,q_auto${w ? `,w_${w}` : ''}${h ? `,h_${h}` : ''},c_${fit}`;

  if (isUrl(src)) return isCloudinaryUrl(src) ? src.replace('/upload/', `/upload/${t}/`) : src;

  const pid = ensureFolder(src, NUTRITION_FOLDER); // images default to nutrition
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${t}/${pid}`;
}

// video: f_auto,q_auto + 720p crop
export const cloudinaryVideoURL = (src, opts = {})=> {
  const { w = 1280, h = 720 } = opts;
  const t = `f_auto,q_auto,w_${w},h_${h},c_fill`;

  if (isUrl(src)) return isCloudinaryUrl(src) ? src.replace('/upload/', `/upload/${t}/`) : src;

  const pid = ensureFolder(src, WORKOUTS_FOLDER);
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${t}/${pid}.mp4`;
}

// poster from video public_id; seek 1s + deliver as image
export const cloudinaryPosterURL = (src, opts = {}) => {
  const { w = 1280, h = 720 } = opts;
  const basePid = isUrl(src) ? src : ensureFolder(src, WORKOUTS_FOLDER);

  if (isUrl(basePid) && isCloudinaryUrl(basePid)) {
    return basePid
      .replace('/video/upload/', `/video/upload/so_1/`)
      .replace('/upload/', `/upload/so_1,f_auto,q_auto,w_${w},h_${h},c_fill/`)
      .replace('/video/upload/', '/image/upload/')
      .replace('/video/', '/image/');
  }

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/so_1,f_auto,q_auto,w_${w},h_${h},c_fill/${basePid}.jpg`;
}
