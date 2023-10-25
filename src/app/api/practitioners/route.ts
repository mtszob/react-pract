import Practitioners from './model'
import { NextRequest, NextResponse } from 'next/server'
import { addData, dbConnect, deleteData, getAll, getById, updateData } from '../db';
import { checkPassword } from '@/services/passwordService';


export const POST = async (request: NextRequest) => {
    dbConnect();

    const reqBody = await request.json();
    const { action, data }: { action: string, data: any } = reqBody;

    switch (action) {
        case 'add': return addData(Practitioners, data);
        case 'delete': return deleteData(Practitioners, data);
        case 'update': return updateData(Practitioners, data);
        case 'getAll': return getAll(Practitioners);
        case 'getById': return getById(Practitioners, data);
        case 'getByName': return getByName(data);
        case 'getByEmailAndPassword': return getByEmailAndPassword(data);
        default: throw Error('Unknown action: ' + action);
    }
}

async function getByName(name: string) {
    try {
        const data = await Practitioners.findOne({ name: name });

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return new NextResponse(`getByName: Error when querying "${name}" from "practitioners" collection`, { status: 500 });
    }
}

async function getByEmailAndPassword(loginData: { email: string, password: string }) {
    try {
        const data = await Practitioners.findOne({ 'login.email': loginData.email });

        if (data) {
            if (!checkPassword(loginData.password, data.login.password)) {
                return NextResponse.json({ error: 'invalid_password' }, { status: 200 });
            }
        } else {
            return NextResponse.json({ error: 'invalid_email' }, { status: 200 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return new NextResponse(`getByEmailAndPassword: Error when querying "${loginData.email}" from "practitioners" collection`, { status: 500 });
    }
}