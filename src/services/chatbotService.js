const RAG_PROXY_URL = '/rag';

const buildError = (response, url) => new Error(`RAG request failed (${response.status}) at ${url}`);

const requestRag = async (path, options = {}) => {
  const baseUrl = RAG_PROXY_URL;
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, options);
  if (!response.ok) {
    throw buildError(response, url);
  }
  return response;
};

export const chatbotService = {
  async sendQuestion(question, sessionId = null, userId = null) {
    try {
      const response = await requestRag('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          session_id: sessionId,
          user_id: userId,
        }),
      });

      const data = await response.json();
      return {
        success: true,
        answer: data.answer,
        sources: data.sources || [],
        sessionId: data.session_id,
      };
    } catch (error) {
      console.error('Error sending question:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async checkStatus() {
    try {
      const response = await requestRag('/status');
      return await response.json();
    } catch (error) {
      console.error('Error checking status:', error);
      return { status: 'error', message: error.message };
    }
  },

  async healthCheck() {
    try {
      const response = await requestRag('/health');
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return null;
    }
  },
};
