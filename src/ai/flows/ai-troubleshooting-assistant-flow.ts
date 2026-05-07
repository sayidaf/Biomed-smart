'use server';
/**
 * @fileOverview An AI-powered troubleshooting assistant for biomedical equipment.
 *
 * - aiTroubleshoot - A function that handles the AI troubleshooting process.
 * - AITroubleshootingInput - The input type for the aiTroubleshoot function.
 * - AITroubleshootingOutput - The return type for the aiTroubleshoot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AITroubleshootingInputSchema = z.object({
  equipmentId: z.string().describe('The unique identifier of the equipment.'),
  problemDescription: z.string().describe('A detailed description of the equipment problem.'),
  symptoms: z.string().optional().describe('Observed symptoms related to the problem.'),
  errorCode: z.string().optional().describe('Any error codes displayed by the equipment.'),
  equipmentDetails: z
    .object({
      name: z.string().describe('The name of the equipment.'),
      manufacturer: z.string().describe('The manufacturer of the equipment.'),
      modelNumber: z.string().describe('The model number of the equipment.'),
      serialNumber: z.string().describe('The serial number of the equipment.'),
      assetNumber: z.string().optional().describe('The asset number of the equipment.'),
      department: z.string().optional().describe('The department where the equipment is located.'),
      purchaseDate: z.string().optional().describe('The purchase date of the equipment (ISO 8601 format).'),
      installationDate: z.string().optional().describe('The installation date of the equipment (ISO 8601 format).'),
      warrantyExpiry: z.string().optional().describe('The warranty expiry date of the equipment (ISO 8601 format).'),
      status: z.string().optional().describe('The current operational status of the equipment.'),
    })
    .describe('Detailed information about the equipment.'),
  manualsDataUri: z
    .string()
    .optional()
    .describe(
      "Equipment manuals as a data URI that must include a MIME type (e.g., 'application/pdf') and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. Multiple manuals can be concatenated or combined into a single document if supported."
    ),
  maintenanceHistory: z
    .string()
    .optional()
    .describe('A summary or log of past maintenance activities for the equipment.'),
  previousFaultLogs: z
    .string()
    .optional()
    .describe('A summary or log of previous fault reports and resolutions for the equipment.'),
});
export type AITroubleshootingInput = z.infer<typeof AITroubleshootingInputSchema>;

const AITroubleshootingOutputSchema = z.object({
  diagnosis: z
    .string()
    .describe('A concise diagnosis of the equipment problem.'),
  potentialCauses: z
    .array(z.string())
    .describe('A list of potential causes for the identified problem.'),
  stepByStepGuidance: z
    .array(z.string())
    .describe('A step-by-step guide for diagnosing and resolving the issue.'),
  recommendedActions: z
    .array(z.string())
    .describe('A list of recommended actions to fix the problem or prevent recurrence.'),
  warningsAndPrecautions: z
    .array(z.string())
    .optional()
    .describe('Important warnings or precautions to take during troubleshooting.'),
  estimatedRepairTime: z
    .string()
    .optional()
    .describe('An estimate of the time required for repair.'),
});
export type AITroubleshootingOutput = z.infer<typeof AITroubleshootingOutputSchema>;

const aiTroubleshootingPrompt = ai.definePrompt({
  name: 'aiTroubleshootingPrompt',
  input: { schema: AITroubleshootingInputSchema },
  output: { schema: AITroubleshootingOutputSchema },
  prompt: `You are an expert Biomedical Engineering troubleshooting assistant.
Your goal is to provide comprehensive, step-by-step diagnostic and repair guidance for medical equipment issues.
Use all provided information including equipment details, problem description, symptoms, error codes, maintenance history, previous fault logs, and especially the equipment manual, to generate context-aware recommendations.

Equipment Details:
Name: {{{equipmentDetails.name}}}
Manufacturer: {{{equipmentDetails.manufacturer}}}
Model Number: {{{equipmentDetails.modelNumber}}}
Serial Number: {{{equipmentDetails.serialNumber}}}
{{#if equipmentDetails.assetNumber}}Asset Number: {{{equipmentDetails.assetNumber}}}{{/if}}
{{#if equipmentDetails.department}}Department: {{{equipmentDetails.department}}}{{/if}}
{{#if equipmentDetails.status}}Status: {{{equipmentDetails.status}}}{{/if}}

Problem Description: {{{problemDescription}}}
{{#if symptoms}}Symptoms: {{{symptoms}}}{{/if}}
{{#if errorCode}}Error Code: {{{errorCode}}}{{/if}}

{{#if maintenanceHistory}}Maintenance History:
{{{maintenanceHistory}}}{{/if}}

{{#if previousFaultLogs}}Previous Fault Logs:
{{{previousFaultLogs}}}{{/if}}

{{#if manualsDataUri}}Equipment Manuals: {{media url=manualsDataUri}}{{/if}}

Based on the above information, provide a detailed diagnosis, potential causes, step-by-step troubleshooting and repair guidance, and recommended actions. Ensure the guidance is practical and safe for a biomedical engineer. Respond with a JSON object conforming to the AITroubleshootingOutputSchema.`,
});

const aiTroubleshootingFlow = ai.defineFlow(
  {
    name: 'aiTroubleshootingFlow',
    inputSchema: AITroubleshootingInputSchema,
    outputSchema: AITroubleshootingOutputSchema,
  },
  async (input) => {
    const { output } = await aiTroubleshootingPrompt(input);
    return output!;
  }
);

export async function aiTroubleshoot(input: AITroubleshootingInput): Promise<AITroubleshootingOutput> {
  return aiTroubleshootingFlow(input);
}
