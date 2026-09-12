// Template Management components
export {
  EmailTemplateManager,
  EmailTemplateList,
  EmailTemplateEditor,
} from './template-management';

// Email sending components
export { IntegratedEmailSender } from './email-sender';

// Email outbox components
export { EmailOutbox } from './outbox';

// Shared components
export { ErrorBoundary, getTemplateEditorConfig, getEmailSenderConfig } from './shared';
