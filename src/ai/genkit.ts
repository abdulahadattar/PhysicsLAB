/**
 * @fileOverview Initializes and configures the Genkit AI instance.
 * This file sets up the Genkit framework with necessary plugins (e.g., Google AI for Gemini models)
 * and defines the default AI model to be used across the application.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// This allows the application to use Google's generative AI models, like Gemini.
export const ai = genkit({
  plugins: [
    googleAI() // Using the googleAI plugin. Ensure API keys are set in environment variables for this to work.
  ],
  // Optionally, specify a default model to be used by flows if not overridden.
  // Gemini 2.0 Flash is a good balance of capability and speed.
  model: 'googleai/gemini-2.0-flash',
});
