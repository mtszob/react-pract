import mongoose from 'mongoose';


const patientSchema = new mongoose.Schema({
    dob: { type: String, required: true },
    identifier: { type: String, required: true, unique: true },
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
    practitioner: String
});

export default mongoose.models.Patients || mongoose.model('Patients', patientSchema);