import { z } from 'zod';


export const prefixRegex = /^[A-Za-záéíóöőúüűÁÉÍÓÖŐÚÜŰ.]*$/;
export const lnameRegex = /^[A-Za-záéíóöőúüűÁÉÍÓÖŐÚÜŰ-\s]*$/;
export const fnameRegex = /^[A-Za-záéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]*$/;
export const suffixRegex = /^[A-Za-záéíóöőúüűÁÉÍÓÖŐÚÜŰ]*$/;
export const phoneRegex = /^$|^\+36[0-9]{9}$/;
export const postalCodeRegex = /^$|^[0-9]{4}$/;
export const ssnRegex = /^$|^\d{3}-?\d{3}-?\d{3}$/;

export const zodNameObj = z.object({
    prefix: z.string().regex(prefixRegex, { message: 'invalidPrefix' }).max(20).or(z.literal('')),
    last: z.string().regex(lnameRegex, { message: 'invalidLastName' }).min(1).max(20),
    first: z.string().regex(fnameRegex, { message: 'invalidFirstName' }).min(1).max(20),
    suffix: z.string().regex(suffixRegex, { message: 'invalidSuffix' }).max(20).or(z.literal(''))
});

export const zodTelecom = z.object({
    email: z.string().email({ message: 'invalidEmail' }).min(5).or(z.literal('')),
    phone: z.string().regex(phoneRegex, { message: 'invalidPhone' }).min(1).max(12)
});

export const zodAddress = z.object({
    city: z.string().min(1).max(20),
    postalCode: z.string().regex(postalCodeRegex, { message: 'invalidPostalCode' }).min(1).max(4),
    line: z.string().min(1).max(40)
});

export const zodDob = z.string().min(1).refine((dateStr: string) => {
    const date = new Date(dateStr);
    return dateStr === '' || (new Date('1900-01-01') <= date && date < new Date());
}, { message: 'invalidDateOfBirth' });


export function getDeepAttribute(obj: any, attributeChain: string) {
    let currentAttribute = obj;
    const attributes = attributeChain.split('.');

    attributes.forEach(attribute => {
        if (currentAttribute === undefined) return;
        currentAttribute = currentAttribute[attribute];
    });

    return currentAttribute;
}