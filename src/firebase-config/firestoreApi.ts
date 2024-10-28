import {
  firebase,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {firestore} from '../config/firebase';
import {identity} from 'lodash';

export interface BatchOption<T> {
  ref: FirebaseFirestoreTypes.DocumentReference;
  action: BatchAction;
  merge?: boolean;
  data?: T;
}
export enum BatchAction {
  Set,
  Delete,
  Update,
}
interface UpdateOptions {
  merge: boolean;
}

export type QueryOperator =
  | '<'
  | '<='
  | '=='
  | '!='
  | '>='
  | '>'
  | 'array-contains'
  | 'in'
  | 'array-contains-any'
  | 'not-in';

type SortOptions = {
  attribute: string;
  order: 'asc' | 'desc';
};

export type QueryOptions = {
  attribute: string | FirebaseFirestoreTypes.FieldPath;
  operator: QueryOperator;
  value: string | number | boolean | any[];
};

export type CollectionOptions = {
  listen?: boolean;
  listenerName?: string;
  sort?: SortOptions;
  queries?: QueryOptions[];
  limit?: number;
  lazyLoad?: boolean;
};

export const collectionRef = (path: string) => {
  return firestore.collection(`${path}`);
};

export const documentRef = (collectionPath: string, documentId: string) => {
  return firestore.doc(`${collectionPath}/${documentId}`);
};

export const getDocument = async <T>(
  collectionPath: string,
  documentId: string,
): Promise<T | null> => {
  const ref: FirebaseFirestoreTypes.DocumentReference = documentRef(
    collectionPath,
    documentId,
  );
  const snap = await ref.get();
  if (!snap.exists) {
    return null;
  }
  return {id: snap.id, ...snap.data()} as T;
};

export const setDocument = async (
  collectionPath: string,
  documentId: string,
  data: any,
  options?: UpdateOptions,
) => {
  const ref: FirebaseFirestoreTypes.DocumentReference = documentRef(
    collectionPath,
    documentId,
  );
  await ref.set(data, {
    ...(options || {}),
    merge: options && options.merge === false ? false : true,
  });
};

export const updateDocument = async (
  collectionPath: string,
  documentId: string,
  data: any,
) => {
  const ref: FirebaseFirestoreTypes.DocumentReference = documentRef(
    collectionPath,
    documentId,
  );
  await ref.update(data);
};

export const deleteDocument = async (
  collectionPath: string,
  documentId: string,
) => {
  const ref: FirebaseFirestoreTypes.DocumentReference = documentRef(
    collectionPath,
    documentId,
  );
  await ref.delete();
};

export const createDocument = async (collectionPath: string, data?: any) => {
  const documentId = generateId(collectionPath);
  await setDocument(collectionPath, documentId, data);
  return documentId;
};

export const generateId = (path: string) => {
  const ref = collectionRef(path).doc();
  return ref.id;
};

export const getQuery = (collection: string, options?: CollectionOptions) => {
  const baseQuery: FirebaseFirestoreTypes.CollectionReference =
    collectionRef(collection);
  let query: FirebaseFirestoreTypes.Query = baseQuery;
  if (options && options.queries) {
    const {queries} = options;

    queries.forEach(({attribute, operator, value}) => {
      query = query.where(attribute, operator, value);
    });
  }

  if (options && options.sort) {
    const {attribute, order} = options.sort;
    query = query.orderBy(attribute, order);
  }

  if (options && options.limit) {
    query = query.limit(options.limit);
  }

  return query;
};

export const getDocuments = async <T extends {id?: string}>(
  ids: string[],
  collectionPath: string,
) => {
  const chunkSize = 10;
  const numChunks = Math.ceil(ids.length / chunkSize);

  const promises = Array.from({length: numChunks}, (_, index) => {
    const start = index * chunkSize;
    const end = (index + 1) * chunkSize;
    const chunkIds = ids.slice(start, end);

    if (chunkIds.length > 0) {
      return getCollection<T>(collectionPath, {
        queries: [
          {
            attribute: firebase.firestore.FieldPath.documentId(),
            operator: 'in',
            value: chunkIds,
          },
        ],
      });
    }

    return Promise.resolve([]); // Return an empty array for empty chunks
  });

  const results = await Promise.all<Promise<T[]>[]>(promises);
  const full = results.flat();

  const entities = ids.map(id => full.find(f => f.id === id)).filter(identity);

  return entities;
};

export const getDocs = async <T>(collection: string, ids: string[]) => {
  const promises: Promise<
    FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
  >[] = [];

  for (const id of ids) {
    const ref = collectionRef(collection);
    promises.push(ref.doc(id).get());
  }

  const docs = await Promise.all(promises);
  return docs
    .filter(doc => doc.exists)
    .map(doc => ({...doc.data(), id: doc.id} as unknown as T));
};

export const getCollection = async <T>(
  collection: string,
  options?: CollectionOptions,
) => {
  const q = getQuery(collection, options);

  const snap = await q.get();
  if (snap.empty) {
    return [];
  }

  return snap.docs.map(
    (doc: FirebaseFirestoreTypes.DocumentData) =>
      ({id: doc.id, ...doc.data()} as unknown as T),
  );
};

export const executeBatch = async <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  options: BatchOption<T>[],
) => {
  const batch = firestore.batch();
  for (const option of options) {
    switch (option.action) {
      case BatchAction.Set:
        batch.set(option.ref, option.data!, {
          merge: option.merge !== undefined ? option.merge : true,
        });
        break;
      case BatchAction.Delete:
        batch.delete(option.ref);
        break;
      case BatchAction.Update:
        batch.update(option.ref, option.data!);
        break;
    }
  }
  return batch
    .commit()
    .then(() => console.log('Batch successfully commited.'))
    .catch(console.error);
};
