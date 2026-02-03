import {readFile} from 'fs';
import pdf from 'pdf-parse';

interface RowData {
  [key: string]: string | number;
}
