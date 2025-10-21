// Main Email Management component
export { default as EmailManagement } from './EmailManagement';

// Template Management components
export {
  EmailTemplateManager,
  EmailTemplateList,
  EmailTemplateEditor,
} from './template-management';

// Email sending components
export { IntegratedEmailSender } from './email-sender';

// Shared components
export { ErrorBoundary, getTemplateEditorConfig, getEmailSenderConfig } from './shared';
