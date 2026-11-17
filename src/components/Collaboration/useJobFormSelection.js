import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { JOB_FORM_POSITION_OPTIONS } from '../JobFormManagement/jobFormPositions';

const titleKey = title =>
  String(title || '')
    .trim()
    .toLowerCase();
const formId = form => form?._id || form?.id;

function activeForms(data) {
  const forms = data?.forms ?? data;
  if (!Array.isArray(forms)) throw new Error('Invalid form catalog');
  return forms.filter(
    form =>
      formId(form) &&
      titleKey(form.title) &&
      form.isActive !== false &&
      !titleKey(form.title).startsWith('[retired]'),
  );
}

export default function useJobFormSelection({ enabled, onReset, onLoad }) {
  const [forms, setForms] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedFormId, setSelectedFormId] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const requestVersion = useRef(0);

  const loadForm = useCallback(
    async (title, catalog, targetId = '') => {
      const version = ++requestVersion.current;
      setSelectedTitle(title);
      setSelectedFormId(targetId);
      setError('');
      setStatus('loading');
      onReset(title);
      const matches = catalog.filter(form => titleKey(form.title) === titleKey(title));
      if (matches.length > 1 && !targetId) {
        setStatus('choosing');
        return;
      }
      const target = targetId ? matches.find(form => formId(form) === targetId) : matches[0];
      if (!target) {
        setStatus('error');
        setError(`No saved questionnaire is available for ${title}. Choose another role.`);
        return;
      }
      setSelectedFormId(formId(target));
      try {
        const response = await axios.get(ENDPOINTS.GET_JOB_FORM(formId(target)));
        if (version !== requestVersion.current) return;
        const form = response.data?.form;
        if (
          !form ||
          formId(form) !== formId(target) ||
          titleKey(form.title) !== titleKey(target.title) ||
          form.isActive === false ||
          !Array.isArray(form.questions)
        )
          throw new Error('The saved questionnaire does not match the selected role');
        onLoad(form);
        setSelectedTitle(form.title);
        setStatus('ready');
      } catch {
        if (version !== requestVersion.current) return;
        setStatus('error');
        setError(
          `Could not load the questionnaire for ${title}. Use Retry questionnaire to try again.`,
        );
      }
    },
    [onReset, onLoad],
  );

  useEffect(() => {
    let ignore = false;
    setCatalogLoading(true);
    setStatus('loading');
    setError('');
    setSelectedTitle('');
    setSelectedFormId('');
    onReset('');
    async function loadCatalog() {
      const response = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS);
      if (ignore) return;
      const catalog = activeForms(response.data);
      setForms(catalog);
      setCatalogLoading(false);
      if (catalog.length) {
        const initial = catalog.find(
          candidate =>
            catalog.filter(form => titleKey(form.title) === titleKey(candidate.title)).length === 1,
        );
        await loadForm((initial || catalog[0]).title, catalog);
      } else {
        setStatus('error');
        setError('No active saved questionnaires are available.');
      }
    }
    if (enabled) {
      loadCatalog().catch(() => {
        if (ignore) return;
        setCatalogLoading(false);
        setStatus('error');
        setError('Could not load the job roles. Please retry.');
      });
    } else setCatalogLoading(false);
    return () => {
      ignore = true;
      requestVersion.current += 1;
    };
  }, [enabled, retry, loadForm, onReset]);

  const options = [
    ...new Map(
      // Saved spelling takes precedence over built-ins. Keep the exact loaded
      // title selectable even when duplicate questionnaires use different casing.
      [...JOB_FORM_POSITION_OPTIONS, ...forms.map(form => form.title), selectedTitle]
        .filter(title => titleKey(title))
        .map(title => [titleKey(title), title]),
    ).values(),
  ];
  return {
    selectedTitle,
    selectedFormId,
    matchingForms: forms.filter(form => titleKey(form.title) === titleKey(selectedTitle)),
    status,
    error,
    catalogLoading,
    options,
    selectRole: (title, targetId) => loadForm(title, forms, targetId),
    retryForm: () => loadForm(selectedTitle, forms, selectedFormId),
    retryCatalog: () => setRetry(value => value + 1),
  };
}
