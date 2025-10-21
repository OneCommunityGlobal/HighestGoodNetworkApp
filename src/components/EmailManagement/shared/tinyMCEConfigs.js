// TinyMCE Configuration for Template Editor (Advanced)
export const getTemplateEditorConfig = (darkMode, formData) => ({
  license_key: 'gpl',
  height: 1000,
  menubar: 'file edit view insert format tools table help',
  placeholder: 'Enter your email content here...',
  skin: darkMode ? 'oxide-dark' : 'oxide',
  content_css: 'default',

  // Comprehensive plugin list for maximum functionality
  plugins: [
    'advlist',
    'anchor',
    'autolink',
    'autoresize',
    'autosave',
    'charmap',
    'code',
    'codesample',
    'directionality',
    'emoticons',
    'fontsize',
    'fullscreen',
    'help',
    'hr',
    'image',
    'importcss',
    'insertdatetime',
    'link',
    'lineheight',
    'lists',
    'media',
    'nonbreaking',
    'pagebreak',
    'preview',
    'quickbars',
    'save',
    'searchreplace',
    'table',
    'template',
    'textcolor',
    'textpattern',
    'visualblocks',
    'visualchars',
    'wordcount',
  ],

  // Comprehensive toolbar with all features
  toolbar: [
    'undo redo | blocks fontfamily fontsize | lineheight | ' +
      'forecolor backcolor | ' +
      'bold italic underline strikethrough | ' +
      'alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | blockquote | ' +
      'link image media table | insertvariable | ' +
      'removeformat | code | preview | fullscreen | help',
  ],

  // Extended font family options
  font_family_formats:
    'Arial=arial,helvetica,sans-serif; ' +
    'Arial Black=arial black,avant garde; ' +
    'Book Antiqua=book antiqua,palatino; ' +
    'Comic Sans MS=comic sans ms,sans-serif; ' +
    'Courier New=courier new,courier; ' +
    'Georgia=georgia,palatino; ' +
    'Helvetica=helvetica; ' +
    'Impact=impact,chicago; ' +
    'Inter=inter,sans-serif; ' +
    'Nunito=nunito,sans-serif; ' +
    'PT Sans=pt sans,sans-serif; ' +
    'Ubuntu=ubuntu,sans-serif',

  // Ultra-granular font sizes from 8pt to 144pt
  font_size_formats:
    '8pt 9pt 10pt 11pt 12pt 13pt 14pt 15pt 16pt 17pt 18pt 19pt 20pt 21pt 22pt 23pt 24pt 25pt 26pt 27pt 28pt 29pt 30pt 31pt 32pt 33pt 34pt 35pt 36pt 37pt 38pt 39pt 40pt 42pt 44pt 46pt 48pt 50pt 52pt 54pt 56pt 58pt 60pt 62pt 64pt 66pt 68pt 70pt 72pt 74pt 76pt 78pt 80pt 84pt 88pt 92pt 96pt 100pt 104pt 108pt 112pt 116pt 120pt 124pt 128pt 132pt 136pt 140pt 144pt',

  // Line height options with more granular control
  line_height_formats:
    '0.5 0.6 0.7 0.8 0.9 1 1.1 1.2 1.3 1.4 1.5 1.6 1.7 1.8 1.9 2 2.1 2.2 2.3 2.4 2.5 2.6 2.7 2.8 2.9 3 3.5 4 4.5 5',

  // Setup function for additional customizations
  setup: function(editor) {
    // Initialize with light mode styling
    editor.on('init', function() {
      const body = editor.getBody();
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#212529';
    });

    // Custom button for inserting variables
    editor.ui.registry.addButton('insertvariable', {
      text: 'Variable',
      tooltip: 'Insert Template Variable',
      onAction: function() {
        const variables = formData?.variables || [];
        if (variables.length === 0) {
          editor.notificationManager.open({
            text: 'No variables defined. Please add variables first.',
            type: 'warning',
          });
          return;
        }

        const variableOptions = variables.map(v => ({
          text: `${v.label} ({{${v.name}}})`,
          value: `{{${v.name}}}`,
        }));

        editor.windowManager.open({
          title: 'Insert Variable',
          body: {
            type: 'panel',
            items: [
              {
                type: 'selectbox',
                name: 'variable',
                label: 'Select Variable:',
                items: variableOptions,
              },
            ],
          },
          buttons: [
            {
              type: 'cancel',
              text: 'Cancel',
            },
            {
              type: 'submit',
              text: 'Insert',
              primary: true,
            },
          ],
          onSubmit: function(api) {
            const data = api.getData();
            if (data.variable) {
              editor.insertContent(data.variable);
            }
            api.close();
          },
        });
      },
    });
  },

  // Additional configurations for better performance
  paste_data_images: false,
  automatic_uploads: false,
  images_upload_handler: function(blobInfo, success, failure) {
    failure('Please use the URL option to insert images.');
  },

  // Content style for email compatibility
  content_style: `
    body { 
      font-family: Arial, Helvetica, sans-serif; 
      font-size: 14px; 
      line-height: 1.6; 
      background-color: #ffffff !important;
      color: #212529 !important;
      margin: 20px;
      cursor: text !important;
      max-width: none;
    }
  `,
});

// TinyMCE Configuration for Email Sender (Standard)
export const getEmailSenderConfig = darkMode => ({
  license_key: 'gpl',
  height: 300,
  menubar: false,
  placeholder: '',
  skin: darkMode ? 'oxide-dark' : 'oxide',
  branding: false,
  plugins: ['lists', 'link', 'autolink', 'paste', 'fontsize', 'lineheight', 'textcolor'],
  toolbar: [
    'undo redo | blocks fontfamily fontsize | lineheight | ' +
      'forecolor backcolor | ' +
      'bold italic underline strikethrough | ' +
      'alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | blockquote | ' +
      'removeformat | link',
  ],
  statusbar: false,
  resize: false,
  content_style: `body, p, div, span, * { 
    font-family: Arial, Helvetica, sans-serif; 
    font-size: 14px; 
    line-height: 1.5; 
    color: ${darkMode ? '#ffffff' : '#000000'}; 
    background-color: ${darkMode ? '#2d2d2d' : '#ffffff'}; 
    padding: 0;
    margin: 0;
  }`,

  setup: function(editor) {
    editor.on('init', function() {
      editor.getBody().style.fontFamily = 'Arial, Helvetica, sans-serif';
      editor.getBody().style.fontSize = '14px';
      editor.getBody().style.lineHeight = '1.5';
      editor.getBody().style.padding = '10px';
    });
  },
});
