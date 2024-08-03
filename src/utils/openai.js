import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

const getModel = async () => {
  try {
    const model = await genAI.getGenerativeModel({ model: 'gemini-pro' });
    return model;
  } catch (error) {
    console.error('Error initializing Gemini model:', error);
    throw error; // Or handle error appropriately
  }
};

export { getModel };
