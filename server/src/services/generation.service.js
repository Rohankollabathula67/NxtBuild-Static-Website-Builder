import { askGemini } from './gemini.service.js';
import { getProjectById } from './project.service.js';
import { buildGenerationPrompt } from '../constants/prompts.js';
import { getPreviewCode, parseGenerationResponse } from '../utils/code.utils.js';

export const generateCode = async (projectId, userId, userPrompt) => {
  const project = await getProjectById(projectId, userId);

  const fullPrompt = buildGenerationPrompt(
    project.messages,
    JSON.stringify(
      project.generatedFiles?.length
        ? project.generatedFiles
        : project.generatedCode
          ? [{ path: 'preview.html', language: 'html', content: project.generatedCode }]
          : [],
      null,
      2
    ),
    userPrompt
  );

  const aiResponse = await askGemini(fullPrompt);

  const { description, code, files } = parseGenerationResponse(aiResponse);

  project.messages.push({
    role: 'user',
    content: userPrompt,
    timestamp: new Date(),
  });

  project.messages.push({
    role: 'assistant',
    content: description || 'Here is your generated code.',
    timestamp: new Date(),
  });

  if ((project.generatedCode || project.generatedFiles?.length) && (code || files?.length)) {
    project.versions.push({
      code: project.generatedCode,
      files: project.generatedFiles || [],
      prompt: userPrompt,
      createdAt: new Date(),
    });
  }

  if (files?.length) {
    project.generatedFiles = files;
    project.generatedCode = getPreviewCode(files) || code || '';
  } else if (code) {
    project.generatedCode = code;
    project.generatedFiles = [{
      path: 'preview.html',
      language: 'html',
      content: code,
    }];
  }

  if (project.title === 'Untitled Project' && project.messages.length <= 2) {
    project.title = userPrompt.length > 50
      ? userPrompt.substring(0, 50) + '...'
      : userPrompt;
  }

  project.updatedAt = new Date();
  await project.save();

  return {
    message: {
      role: 'assistant',
      content: description || 'Here is your generated code.',
      timestamp: new Date(),
    },
    generatedCode: project.generatedCode,
    generatedFiles: project.generatedFiles || [],
    versionIndex: project.versions.length,
  };
};
