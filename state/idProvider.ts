
import { generateId as defaultGenerateId } from '../utils/id.js';

let implementation = defaultGenerateId;

export const generateId = (prefix: string): string => implementation(prefix);

export const setGenerateId = (fn: (prefix: string) => string): void => {
    implementation = fn;
};
