import httpService from './httpService';
import { ENDPOINTS } from '../utils/URL';

export function listPineconeDocuments(namespace = '') {
  const endpoint = ENDPOINTS.PINECONE_DOCUMENTS(namespace);
  return httpService.get(endpoint).then(res => res.data);
}

export function uploadPineconeDocument({ file, fileHash, namespace = '' }) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileHash', fileHash);
  if (namespace) {
    formData.append('namespace', namespace);
  }

  return httpService
    .post(ENDPOINTS.PINECONE_DOCUMENT_UPLOAD(), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(res => res.data);
}

export function reindexPineconeDocumentByHash({ hash, namespace = '' }) {
  return httpService
    .post(ENDPOINTS.PINECONE_REINDEX_BY_HASH(), {
      fileHash: hash,
      namespace,
    })
    .then(res => res.data);
}

export default {
  listPineconeDocuments,
  uploadPineconeDocument,
  reindexPineconeDocumentByHash,
};
