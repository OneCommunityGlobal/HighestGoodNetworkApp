import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
} from 'reactstrap';
import { ENDPOINTS } from '~/utils/URL';
import styles from './EquipmentDetailPage.module.css';

const categories = ['Invoice', 'Rental agreement', 'Inspection report'];
const fileTypes = { 'application/pdf': 'PDF', 'image/jpeg': 'JPG', 'image/png': 'PNG' };
const maxSize = 5 * 1024 * 1024;
const uploadError = 'Choose a PDF, JPG or PNG file up to 5 MB.';

function EquipmentAttachments({ equipmentId, canManage, onAuditLoaded }) {
  const path = `${ENDPOINTS.BM_EQUIPMENT_BY_ID(equipmentId)}/attachments`;
  const [files, setFiles] = useState(null);
  const [revision, setRevision] = useState(0);
  const [listError, setListError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [category, setCategory] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    let current = true;
    setListError('');
    axios
      .get(path)
      .then(({ data }) => {
        if (current) {
          setFiles(data.files);
          onAuditLoaded({ equipmentId, entries: data.auditHistory });
        }
      })
      .catch(() => {
        if (current) setListError('Could not load attachments.');
      });
    return () => {
      current = false;
    };
  }, [path, revision, equipmentId, onAuditLoaded]);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview.url);
    },
    [preview],
  );

  const save = async event => {
    event.preventDefault();
    if (
      editor.mode === 'add' &&
      (!file || !Object.hasOwn(fileTypes, file.type) || file.size === 0 || file.size > maxSize)
    ) {
      setActionError(uploadError);
      return;
    }
    setBusy(true);
    setActionError('');
    try {
      if (editor.mode === 'edit') {
        await axios.patch(`${path}/${editor.attachment._id}`, {
          category,
          originalCategory: editor.attachment.category,
        });
      } else if (editor.mode === 'remove') {
        await axios.delete(`${path}/${editor.attachment._id}`);
      } else {
        const data = new FormData();
        data.append('category', category);
        data.append('file', file);
        await axios.post(path, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setEditor(null);
      onAuditLoaded(null);
      setRevision(value => value + 1);
    } catch (error) {
      setActionError(error.response?.data?.message || 'Could not save the attachment change.');
    } finally {
      setBusy(false);
    }
  };

  const openFile = async (attachment, previewOnly) => {
    setBusy(true);
    setActionError('');
    try {
      const { data } = await axios.get(`${path}/${attachment._id}`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      if (previewOnly) {
        setPreviewFailed(false);
        setPreview({ ...attachment, url });
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      setActionError('Could not open the attachment.');
    } finally {
      setBusy(false);
    }
  };

  const openEditor = (mode, attachment) => {
    setActionError('');
    setFile(null);
    setCategory(attachment?.category || '');
    setEditor({ mode, attachment });
  };
  const editorLabels = {
    add: { title: 'Add attachment', submit: 'Upload' },
    edit: { title: 'Edit attachment category', submit: 'Save' },
    remove: { title: 'Remove attachment', submit: 'Remove' },
  };

  return (
    <section className={styles.recordSections} aria-labelledby="equipment-attachments">
      <div className={styles.recordSection}>
        <h2 id="equipment-attachments">Attachments</h2>
        {canManage && (
          <Button onClick={() => openEditor('add')} disabled={busy}>
            Add attachment
          </Button>
        )}
        {listError && (
          <p role="alert">
            {listError} <Button onClick={() => setRevision(value => value + 1)}>Retry</Button>
          </p>
        )}
        {!editor && actionError && <p role="alert">{actionError}</p>}
        {!files && !listError && <p role="status">Loading attachments…</p>}
        {files?.length === 0 && <p>No attachments uploaded.</p>}
        {files?.length > 0 && (
          <Table responsive className={styles.recordTable}>
            <thead>
              <tr>
                <th scope="col">File</th>
                <th scope="col">Category</th>
                <th scope="col">Type</th>
                <th scope="col">Size</th>
                <th scope="col">Uploader</th>
                <th scope="col">Uploaded</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map(attachment => (
                <tr key={attachment._id}>
                  <td>{attachment.name}</td>
                  <td>{attachment.category}</td>
                  <td>{fileTypes[attachment.mimeType]}</td>
                  <td>{attachment.size.toLocaleString()} bytes</td>
                  <td>
                    {[attachment.uploader?.firstName, attachment.uploader?.lastName]
                      .filter(Boolean)
                      .join(' ') || 'Unknown user'}
                  </td>
                  <td>
                    <time dateTime={attachment.uploadedAt}>
                      {new Date(attachment.uploadedAt).toLocaleString()}
                    </time>
                  </td>
                  <td>
                    <Button
                      color="link"
                      size="sm"
                      disabled={busy}
                      onClick={() => openFile(attachment, true)}
                      aria-label={`Preview ${attachment.name}`}
                    >
                      Preview
                    </Button>
                    <Button
                      color="link"
                      size="sm"
                      disabled={busy}
                      onClick={() => openFile(attachment, false)}
                      aria-label={`Download ${attachment.name}`}
                    >
                      Download
                    </Button>
                    {canManage && (
                      <>
                        <Button
                          color="link"
                          size="sm"
                          disabled={busy}
                          aria-label={`Edit category for ${attachment.name}`}
                          onClick={() => openEditor('edit', attachment)}
                        >
                          Edit category
                        </Button>
                        <Button
                          color="link"
                          size="sm"
                          disabled={busy}
                          aria-label={`Remove ${attachment.name}`}
                          onClick={() => openEditor('remove', attachment)}
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
      {editor && (
        <Modal
          isOpen
          labelledBy="equipment-attachment-editor"
          toggle={busy ? undefined : () => setEditor(null)}
        >
          <Form onSubmit={save}>
            <ModalHeader id="equipment-attachment-editor">
              {editorLabels[editor.mode].title}
            </ModalHeader>
            <ModalBody>
              {editor.mode === 'remove' && (
                <p>Remove {editor.attachment.name} from this equipment?</p>
              )}
              {editor.mode !== 'remove' && (
                <FormGroup>
                  <Label for="equipment-attachment-category">Category</Label>
                  <Input
                    id="equipment-attachment-category"
                    type="select"
                    value={category}
                    required
                    disabled={busy}
                    onChange={event => setCategory(event.target.value)}
                  >
                    <option value="">Select a category</option>
                    {categories.map(choice => (
                      <option key={choice}>{choice}</option>
                    ))}
                  </Input>
                </FormGroup>
              )}
              {editor.mode === 'add' && (
                <FormGroup>
                  <Label for="equipment-attachment-file">File (PDF, JPG or PNG, up to 5 MB)</Label>
                  <Input
                    id="equipment-attachment-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                    disabled={busy}
                    onChange={event => setFile(event.target.files[0])}
                  />
                </FormGroup>
              )}
              {actionError && <p role="alert">{actionError}</p>}
            </ModalBody>
            <ModalFooter>
              <Button type="button" disabled={busy} onClick={() => setEditor(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                color={editor.mode === 'remove' ? 'danger' : 'primary'}
                disabled={busy}
              >
                {busy ? 'Working…' : editorLabels[editor.mode].submit}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      )}
      {preview && (
        <Modal
          isOpen
          size="lg"
          labelledBy="equipment-attachment-preview"
          toggle={() => setPreview(null)}
        >
          <ModalHeader id="equipment-attachment-preview" toggle={() => setPreview(null)}>
            {preview.name}
          </ModalHeader>
          <ModalBody>
            {previewFailed && (
              <p role="status">The preview could not be displayed. Download the file to open it.</p>
            )}
            {!previewFailed && preview.mimeType === 'application/pdf' && (
              <>
                <p>If the PDF preview is blank, download the file to open it.</p>
                <iframe title={preview.name} src={preview.url} className={styles.attachmentPdf} />
              </>
            )}
            {!previewFailed && preview.mimeType !== 'application/pdf' && (
              <img
                src={preview.url}
                alt={preview.name}
                className={styles.attachmentImage}
                onError={() => setPreviewFailed(true)}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" outline onClick={() => setPreview(null)}>
              Close preview
            </Button>
            <Button tag="a" color="primary" href={preview.url} download={preview.name}>
              Download file
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </section>
  );
}

export default EquipmentAttachments;
