import Practitioners from './model'
import { NextRequest, NextResponse } from 'next/server'
import { addData, dbConnect, deleteData, updateData } from '../db';


export const GET = async () => {
    dbConnect();

    try {
        const practitioners: any = await Practitioners.find();
        return NextResponse.json(practitioners, { status: 200 });
    } catch (error) {
        console.log(error);
        return new NextResponse('Error when fetching data from \"practitioners\" collection', { status: 500 });
    }
}

export const POST = async (request: NextRequest) => {
    dbConnect();

    const reqBody = await request.json();
    const { action, data }: { action: string, data: any } = reqBody;

    switch (action) {
        case 'add': return addData(Practitioners, data);
        case 'delete': return deleteData(Practitioners, data);
        case 'update': return updateData(Practitioners, data);
        case 'getById': return getPractitionerById(Practitioners, data);
        case 'getByName': return getPractitionerByName(Practitioners, data);
        default: throw Error('Unknown action: ' + action);
    }
}


async function getPractitionerById(model: typeof Practitioners, id: string) {
    try {
        const data = await model.findById(id);

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return new NextResponse(`Error when querying "${id}" from "practitioners" collection`, { status: 500 });
    }
}

async function getPractitionerByName(model: typeof Practitioners, name: string) {
    try {
        const data = await model.findOne({ name: name });

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return new NextResponse(`Error when querying "${name}" from "practitioners" collection`, { status: 500 });
    }
}