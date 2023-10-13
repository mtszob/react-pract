import { zodAddress, zodDob, zodNameObj, zodTelecom } from '@/constants/misc';
import { z } from 'zod';

export class Practitioner {
    _id?: string;
    admin: boolean | null = null;
    dob = '';
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
    login = {
        email: '',
        password: ''
    };
    organization: string | null = null;
}

export const practitionerSchema = z.object({
    _id: z.string().optional(),
    nameObj: zodNameObj,
    dob: zodDob,
    isMale: z.boolean(),
    admin: z.boolean(),
    telecom: zodTelecom,
    address: zodAddress,
    organization: z.string().nullable()
});