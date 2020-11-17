import { Photo } from './photo';

export interface Member { // export to use it in other classes
    id: number;
    username: string;
    photoUrl: string;
    age: number;
    knownAs: string;
    created: Date;
    lastActive: Date;
    gender: string;
    introduction: string;
    lookingFor: string;
    interests: string;
    city: string;
    country: string;
    photos: Photo[];
}

// to translate json to ts -> http://www.jsontots.com/
