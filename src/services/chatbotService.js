const RAG_SERVICE_URL = '/rag';

export const chatbotService = {
  async sendQuestion(question, sessionId = null, userId = null) {
    try {
      const response = await fetch(`${RAG_SERVICE_URL}/chat`, {
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

      if (!response.ok) {
        throw new Error(`Chat error: ${response.status}`);
      }

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
      const response = await fetch(`${RAG_SERVICE_URL}/status`);
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking status:', error);
      return { status: 'error', message: error.message };
    }
  },

  async healthCheck() {
    try {
      const response = await fetch(`${RAG_SERVICE_URL}/health`);
      if (!response.ok) {
        throw new Error('Service unavailable');
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return null;
    }
  },
};
