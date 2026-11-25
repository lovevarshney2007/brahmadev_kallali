/**
 * Official Google Maps targets for Shri Kshetra Brahmadev Devasthan
 * Situated in Kalhali (Kallali), Kandhar, Nanded district, Maharashtra (PIN: 431715).
 */
export const TEMPLE_MAPS_QUERY =
  'Shri Brahmadev Devasthan, Kalhali, Kandhar, Nanded, Maharashtra 431715';

export const TEMPLE_PLACE_ID = 'ChIJHTid47E3zjsRyBX8P63nhqc';

const ENCODED_QUERY = encodeURIComponent(TEMPLE_MAPS_QUERY);
const PLUS_ENCODED_QUERY = TEMPLE_MAPS_QUERY.replace(/ /g, '+');

export const TEMPLE_MAPS_SEARCH_URL =
  `https://www.google.com/maps/search/?api=1&query=${ENCODED_QUERY}&query_place_id=${TEMPLE_PLACE_ID}`;

export const TEMPLE_MAPS_DIRECTIONS_URL =
  `https://www.google.com/maps/dir/?api=1&destination=${ENCODED_QUERY}&destination_place_id=${TEMPLE_PLACE_ID}`;

export const TEMPLE_MAPS_EMBED_URL =
  `https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1s${PLUS_ENCODED_QUERY}`;
