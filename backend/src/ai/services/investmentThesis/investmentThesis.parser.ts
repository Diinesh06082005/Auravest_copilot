import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { investmentThesisSchema, InvestmentThesisType } from './investmentThesis.schema';

export class InvestmentThesisParser {
  private readonly parser = StructuredOutputParser.fromZodSchema(investmentThesisSchema);

  /**
   * Retrieves instructions formatted for LLMs.
   */
  public getFormatInstructions(): string {
    return this.parser.getFormatInstructions();
  }

  /**
   * Parses the text string from the Gemini response, extracting JSON fence blocks.
   */
  public async parse(text: string): Promise<InvestmentThesisType> {
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
      return investmentThesisSchema.parse(parsed);
    } catch {
      return this.parser.parse(text);
    }
  }
}
