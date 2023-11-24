export function extractJsonContent<T>(input: string | null): T {
  if (!input) throw new Error('Input is empty');
  const regex = /```json\s*([\s\S]*?)\s*```/;
  const matches = input.match(regex);
  if (matches && matches.length > 1) {
    const extractedText = matches[1];
    try {
      const jsonData = JSON.parse(extractedText) as T;
      return jsonData;
    } catch (e) {
      throw new Error(`Extracted text is not valid JSON: ${e}`);
    }
  } else {
    throw new Error('No match found');
  }
}
