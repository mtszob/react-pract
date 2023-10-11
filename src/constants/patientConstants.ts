import { ssnRegex, zodAddress, zodDob, zodNameObj, zodTelecom } from '@/constants/misc';
import { z } from 'zod';

export class Patient {
    _id?: string;
    dob = '';
    identifier = '';
    isMale: boolean | null = null;
    nameObj = {
        prefix: '',
        first: '',
        last: '',
        suffix: ''
    };
    name = '';
    telecom = {
        email: '',
        phone: ''
    };
    address = {
        city: '',
        postalCode: '',
        line: ''
    };
    practitioner: string | null = null;
}

export const patientSchema = z.object({
    _id: z.string().optional(),
    nameObj: zodNameObj,
    name: z.string(),
    identifier: z.string().regex(ssnRegex, { message: 'invalidIdentifier' }).min(1).max(11),
    dob: zodDob,
    isMale: z.boolean(),
    telecom: zodTelecom,
    address: zodAddress,
    practitioner: z.string().nullable()
});