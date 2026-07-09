import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { swotAnalysisSchema, SwotAnalysisType } from './swot.schema';

export class SwotParser {
  private readonly parser = StructuredOutputParser.fromZodSchema(swotAnalysisSchema);

  /**
   * Retrieves instructions formatted for LLMs.
   */
  public getFormatInstructions(): string {
    return this.parser.getFormatInstructions();
  }

  /**
   * Parses the text string from the Gemini response, extracting JSON fence blocks.
   */
  public async parse(text: string): Promise<SwotAnalysisType> {
    let cleanedText = text.trim();
    
    const jsonMatch = cleanedText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      cleanedText = jsonMatch[1].trim();
    } else {
      const braceMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        cleanedText = braceMatch[0].trim();
      }
    }

    try {
      const parsed = JSON.parse(cleanedText);
      return swotAnalysisSchema.parse(parsed);
    } catch {
      return this.parser.parse(text);
    }
  }
}
