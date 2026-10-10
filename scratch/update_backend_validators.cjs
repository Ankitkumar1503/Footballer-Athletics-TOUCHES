const fs = require('fs');

const validatorsPath = 'C:\\Users\\aksin\\OneDrive\\Desktop\\football_backend\\src\\utils\\validators.js';

const content = `import { z } from 'zod';

export const registrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).optional().nullable(),
  country: z.string().min(1, 'Country is required').max(100),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().optional().nullable(),
  footPreference: z.enum(['left', 'right'], {
    errorMap: () => ({ message: 'Foot preference must be either left or right' }),
  }),
  age: z.union([z.number(), z.string()]).optional().nullable(),
  club: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  parentConsent: z.object({
    parentName: z.string().min(1, 'Parent/guardian name is required for players under 13'),
    parentEmail: z.string().email('Valid parent/guardian email is required for players under 13'),
    consentedAt: z.string().optional(),
    verified: z.boolean().optional(),
  }).optional().nullable(),
}).superRefine((data, ctx) => {
  const ageNum = data.age !== undefined && data.age !== null && data.age !== '' ? parseInt(data.age, 10) : null;
  if (ageNum !== null && !isNaN(ageNum) && ageNum < 13) {
    if (!data.parentConsent || !data.parentConsent.parentName || !data.parentConsent.parentEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['parentConsent'],
        message: 'Parent or legal guardian consent is required for players under 13 years of age.',
      });
    }
    if (data.phone && data.phone.trim().length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'Data minimization policy: Personal phone numbers cannot be collected for players under 13.',
      });
    }
  }
});
`;

fs.writeFileSync(validatorsPath, content, 'utf8');
console.log('Successfully updated validators.js with backend under-13 enforcement');
