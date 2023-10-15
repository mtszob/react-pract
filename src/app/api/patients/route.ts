import Patients from './model'
import { NextRequest, NextResponse } from 'next/server'
import { addData, dbConnect, deleteData, updateData } from '../db';


export const GET = async () => {
    dbConnect();

    try {
        const patients: any = await Patients.find();
        return NextResponse.json(patients, { status: 200 });
    } catch (error) {
        console.log(error);
        return new NextResponse('Error when fetching data from \"patients\" collection', { status: 500 });
    }
}

export const POST = async (request: NextRequest) => {
    dbConnect();

    const reqBody = await request.json();
    const { action, data }: { action: string, data: any } = reqBody;

    switch (action) {
        case 'add': return addData(Patients, data);
        case 'delete': return deleteData(Patients, data);
        case 'update': return updateData(Patients, data);
        case 'getByPractitioner': return getByPractitioner(data);
        default: throw Error('Unknown action: ' + action);
    }
}

async function getByPractitioner(practId: string) {
    try {
        const data = await Patients.find({ practitioner: { $in: [practId, null] } });

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return new NextResponse(`getByName: Error when querying data by practitioner ("${practId}") from "patients" collection`, { status: 500 });
    }
}