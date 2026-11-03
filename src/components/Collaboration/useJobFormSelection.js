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
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const requestVersion = useRef(0);

  const loadForm = useCallback(
    async (title, catalog) => {
      const version = ++requestVersion.current;
      setSelectedTitle(title);
      setError('');
      setStatus('loading');
      onReset(title);
      const matches = catalog.filter(form => titleKey(form.title) === titleKey(title));
      if (matches.length !== 1) {
        setStatus('error');
        setError(
          matches.length
            ? 'Several saved forms have this role name. Resolve the duplicate before editing.'
            : `No saved questionnaire is available for ${title}. Choose another role.`,
        );
        return;
      }
      const target = matches[0];
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
        setError(`Could not load the questionnaire for ${title}. Select the role again to retry.`);
      }
    },
    [onReset, onLoad],
  );

  useEffect(() => {
    let ignore = false;
    setCatalogLoading(true);
    setStatus('loading');
    setError('');
    onReset('');
    async function loadCatalog() {
      const response = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS);
      if (ignore) return;
      const catalog = activeForms(response.data);
      setForms(catalog);
      setCatalogLoading(false);
      if (catalog.length) await loadForm(catalog[0].title, catalog);
      else {
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
      [...forms.map(form => form.title), ...JOB_FORM_POSITION_OPTIONS].map(title => [
        titleKey(title),
        title,
      ]),
    ).values(),
  ];
  return {
    selectedTitle,
    status,
    error,
    catalogLoading,
    options,
    selectRole: title => loadForm(title, forms),
    retryCatalog: () => setRetry(value => value + 1),
  };
}
