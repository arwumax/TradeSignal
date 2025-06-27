// ai-providers.ts - AI Provider abstraction layer

export interface AIProvider {
  name: string;
  callAPI: (prompt: string) => Promise<string>;
}

// Available Perplexity models
const PERPLEXITY_FALLBACK_MODELS = [
  "sonar-reasoning",
  "llama-3.1-sonar-large-128k-online", 
  "llama-3.1-sonar-small-128k-online"
];

// Function to clean analysis content by removing <think> tags and citations
const cleanAnalysisContent = (content: string): string => {
  // Remove content between <think> and </think> tags (case insensitive, multiline)
  let cleanedContent = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
  
  // Remove citations like [1], [2], [1][2], [1,2], etc.
  cleanedContent = cleanedContent.replace(/\[\d+(?:,\s*\d+)*\]|\[\d+\]\[\d+\]*/g, '');
  
  // Clean up any extra whitespace or line breaks left behind
  return cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
};

// Perplexity AI Provider
export const createPerplexityProvider = (): AIProvider => ({
  name: 'Perplexity',
  callAPI: async (prompt: string): Promise<string> => {
    console.log('[PERPLEXITY] 🔄 Starting Perplexity API call...');
    
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }
    
    const primaryModel = Deno.env.get('PERPLEXITY_MODEL') || 'sonar-reasoning';
    const modelsToTry = [primaryModel, ...PERPLEXITY_FALLBACK_MODELS.filter(model => model !== primaryModel)];
    
    console.log('[PERPLEXITY] 🎯 Models to try:', modelsToTry);
    
    let lastError: Error | null = null;
    
    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];
      console.log(`[PERPLEXITY] 🤖 Attempting model ${i + 1}/${modelsToTry.length}: ${model}`);
      
      try {
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            top_p: 0.9,
            return_images: false,
            return_related_questions: false,
            top_k: 0,
            stream: false,
            presence_penalty: 0,
            frequency_penalty: 0
          }),
        });

        console.log(`[PERPLEXITY] 📡 Model ${model} Response:`, response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[PERPLEXITY] ❌ Model ${model} failed:`, errorText);
          lastError = new Error(`Perplexity model ${model} failed: ${response.status} - ${errorText}`);
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          lastError = new Error(`No content received from Perplexity model ${model}`);
          continue;
        }

        const cleanedContent = cleanAnalysisContent(content);
        console.log(`[PERPLEXITY] ✅ Model ${model} succeeded! Content length:`, cleanedContent.length);
        return cleanedContent;
        
      } catch (error) {
        console.error(`[PERPLEXITY] ❌ Model ${model} error:`, error);
        lastError = error instanceof Error ? error : new Error(`Unknown error with Perplexity model ${model}`);
        continue;
      }
    }
    
    throw new Error(`All Perplexity models failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }
});

// DeepSeek AI Provider
export const createDeepSeekProvider = (): AIProvider => ({
  name: 'DeepSeek',
  callAPI: async (prompt: string): Promise<string> => {
    console.log('[DEEPSEEK] 🔄 Starting DeepSeek API call...');
    
    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY not configured');
    }
    
    const model = Deno.env.get('DEEPSEEK_MODEL') || 'deepseek-reasoner';
    console.log(`[DEEPSEEK] 🤖 Using model: ${model}`);
    
    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          top_p: 0.9,
          stream: false
        }),
      });

      console.log(`[DEEPSEEK] 📡 Response:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DEEPSEEK] ❌ API Error:`, errorText);
        throw new Error(`DeepSeek API failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`[DEEPSEEK] 📊 Response structure:`, {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        hasContent: !!data.choices?.[0]?.message?.content
      });

      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from DeepSeek API');
      }

      const cleanedContent = cleanAnalysisContent(content);
      console.log(`[DEEPSEEK] ✅ Success! Content length:`, cleanedContent.length);
      return cleanedContent;
      
    } catch (error) {
      console.error(`[DEEPSEEK] ❌ Error:`, error);
      throw error instanceof Error ? error : new Error('Unknown DeepSeek API error');
    }
  }
});

// AI Provider Manager
export class AIProviderManager {
  private providers: Map<string, AIProvider> = new Map();
  
  constructor() {
    this.providers.set('perplexity', createPerplexityProvider());
    this.providers.set('deepseek', createDeepSeekProvider());
  }
  
  async callAI(prompt: string): Promise<string> {
    const primaryProvider = Deno.env.get('PRIMARY_AI_PROVIDER') || 'perplexity';
    const fallbackProvider = primaryProvider === 'perplexity' ? 'deepseek' : 'perplexity';
    
    console.log(`[AI-MANAGER] 🎯 Primary provider: ${primaryProvider}, Fallback: ${fallbackProvider}`);
    
    // Try primary provider first
    try {
      const provider = this.providers.get(primaryProvider);
      if (!provider) {
        throw new Error(`Unknown AI provider: ${primaryProvider}`);
      }
      
      console.log(`[AI-MANAGER] 🚀 Attempting primary provider: ${provider.name}`);
      const result = await provider.callAPI(prompt);
      console.log(`[AI-MANAGER] ✅ Primary provider ${provider.name} succeeded`);
      return result;
      
    } catch (primaryError) {
      console.error(`[AI-MANAGER] ❌ Primary provider ${primaryProvider} failed:`, primaryError);
      
      // Try fallback provider
      try {
        const fallbackProviderInstance = this.providers.get(fallbackProvider);
        if (!fallbackProviderInstance) {
          throw new Error(`Unknown fallback AI provider: ${fallbackProvider}`);
        }
        
        console.log(`[AI-MANAGER] 🔄 Attempting fallback provider: ${fallbackProviderInstance.name}`);
        const result = await fallbackProviderInstance.callAPI(prompt);
        console.log(`[AI-MANAGER] ✅ Fallback provider ${fallbackProviderInstance.name} succeeded`);
        return result;
        
      } catch (fallbackError) {
        console.error(`[AI-MANAGER] ❌ Fallback provider ${fallbackProvider} failed:`, fallbackError);
        
        // Both providers failed
        const primaryErrorMsg = primaryError instanceof Error ? primaryError.message : 'Unknown error';
        const fallbackErrorMsg = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
        
        throw new Error(`All AI providers failed. Primary (${primaryProvider}): ${primaryErrorMsg}. Fallback (${fallbackProvider}): ${fallbackErrorMsg}`);
      }
    }
  }
}