import mime from 'mime';
import mimeMap from '@/helper/mimeMap';

mime.define(mimeMap, true);
export default mime;
