export const parseGenerationResponse = (responseText) => {
  let code = '';
  let description = '';
  let files = [];

  const parseJsonPayload = (text) => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed.files)) return null;

      return {
        description: parsed.description || '',
        files: parsed.files
          .filter((file) => file && file.path && typeof file.content === 'string')
          .map((file) => ({
            path: String(file.path).replace(/\\/g, '/'),
            content: file.content,
            language: file.language || inferLanguageFromPath(file.path),
          })),
      };
    } catch {
      return null;
    }
  };

  const jsonMarker = '```json';
  const jsonStartIndex = responseText.indexOf(jsonMarker);

  if (jsonStartIndex !== -1) {
    description = responseText.slice(0, jsonStartIndex).trim();

    const jsonStart = jsonStartIndex + jsonMarker.length;
    const jsonEnd = responseText.indexOf('```', jsonStart);

    if (jsonEnd !== -1) {
      const parsed = parseJsonPayload(responseText.slice(jsonStart, jsonEnd).trim());
      if (parsed) {
        files = parsed.files;
        description = description || parsed.description;
        code = getPreviewCode(files) || files[0]?.content || '';
        return { description, code, files };
      }
    }
  }

  const parsedRawJson = parseJsonPayload(responseText.trim());
  if (parsedRawJson) {
    files = parsedRawJson.files;
    description = parsedRawJson.description;
    code = getPreviewCode(files) || files[0]?.content || '';
    return { description, code, files };
  }

  const htmlMarker = '```html';
  const startIndex = responseText.indexOf(htmlMarker);

  if (startIndex !== -1) {
    description = responseText.slice(0, startIndex).trim();

    const codeStart = startIndex + htmlMarker.length;
    const endIndex = responseText.indexOf('```', codeStart);

    if (endIndex !== -1) {
      code = responseText.slice(codeStart, endIndex).trim();
    }
  } else {
    const genericMarker = '```';
    const genericStart = responseText.indexOf(genericMarker);

    if (genericStart !== -1) {
      description = responseText.slice(0, genericStart).trim();
      const genericCodeStart = genericStart + genericMarker.length;
      const genericEnd = responseText.indexOf('```', genericCodeStart);

      if (genericEnd !== -1) {
        code = responseText.slice(genericCodeStart, genericEnd).trim();
      }
    } else {
      description = responseText.trim();
    }
  }

  if (code) {
    files = [{
      path: 'preview.html',
      content: code,
      language: 'html',
    }];
  }

  return { description, code, files };
};

export const getPreviewCode = (files = []) => {
  const preferredPreview = files.find((file) => file.path === 'preview.html');
  if (preferredPreview) return preferredPreview.content;

  const indexHtml = files.find((file) => file.path.endsWith('index.html'));
  if (indexHtml) return indexHtml.content;

  const htmlFile = files.find((file) => file.language === 'html' || file.path.endsWith('.html'));
  return htmlFile?.content || '';
};

const inferLanguageFromPath = (path = '') => {
  if (path.endsWith('.jsx')) return 'jsx';
  if (path.endsWith('.js')) return 'javascript';
  if (path.endsWith('.css')) return 'css';
  if (path.endsWith('.html')) return 'html';
  if (path.endsWith('.json')) return 'json';
  if (path.endsWith('.md')) return 'markdown';
  return 'text';
};
