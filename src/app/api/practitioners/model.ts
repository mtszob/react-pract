import { cryptPassword } from '@/services/passwordService';
import mongoose from 'mongoose';


const practitionerSchema = new mongoose.Schema({
    admin: { type: Boolean, required: true },
    dob: { type: String, required: true },
    isMale: { type: Boolean, required: true },
    nameObj: {
        type: {
            prefix: String,
            first: { type: String, required: true },
            last: { type: String, required: true },
            suffix: String,
        },
        required: true
    },
    name: { type: String, required: true },
    telecom: {
        type: {
            email: { type: String, required: true },
            phone: { type: String, required: true },
        },
        required: true
    },
    address: {
        type: {
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            line: { type: String, required: true },
        },
        required: true
    },
    login: {
        type: {
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
        },
        required: false
    },
    organization: String
});

practitionerSchema.pre('save', function (next) {
    if (!this.login) {
        return next();
    }

    try {
        this.login.password = cryptPassword(this.login.password);
        return next();
    } catch (e: any) {
        return next(e);
    }
});

practitionerSchema.pre('updateOne', function (next) {
    const data = this.getUpdate() as any;

    if (!data.login) {
        return next();
    }

    try {
        data.login.password = cryptPassword(data.login.password);
        return next();
    } catch (e: any) {
        return next(e);
    }
});

export default mongoose.models.Practitioners || mongoose.model('Practitioners', practitionerSchema);