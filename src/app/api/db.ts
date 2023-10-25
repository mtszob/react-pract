import mongoose from 'mongoose';
import { NextResponse } from 'next/server';


export const dbConnect = async () => {
    try {
        if (mongoose.connection.readyState) return;
        await mongoose.connect(process.env.MONGODB_URL!);
    } catch (error) {
        console.error('Error when connecting to database:', error);
    }
}

export async function addData(model: mongoose.Model<any>, data: any) {
    const collectionName = model.collection.collectionName;

    try {
        const newData = new model(data);
        const savedData = await newData.save();

        return NextResponse.json({
            message: `Data uploaded to "${collectionName}" collection`,
            sucess: true,
            data: savedData
        }, { status: 200 });

    } catch (error) {
        return new NextResponse(`addData: Error when uploading data to "${collectionName}" collection`, { status: 500 });
    }
}

export async function updateData(model: mongoose.Model<any>, data: any) {
    const collectionName = model.collection.collectionName;

    try {
        await model.updateOne({ _id: data._id }, data);

        return NextResponse.json({
            message: `Data updated in "${collectionName}" collection`,
            sucess: true,
            data
        }, { status: 200 });

    } catch (error) {
        return new NextResponse(`updateData: Error when updating "${data.name}" from "${collectionName}" collection`, { status: 500 });
    }
}

export async function deleteData(model: mongoose.Model<any>, data: any) {
    const collectionName = model.collection.collectionName;

    try {
        await model.deleteOne({ name: data.name });

        return NextResponse.json({
            message: `"${data.name}" deleted from "${collectionName}" collection`,
            sucess: true,
            data
        }, { status: 200 });

    } catch (error) {
        return new NextResponse(`deleteData: Error when deleting "${data.name}" from "${collectionName}" collection`, { status: 500 });
    }
}

export async function getAll(model: mongoose.Model<any>) {
    const collectionName = model.collection.collectionName;

    try {
        const data = await model.find();

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return new NextResponse(`getAll: Error when fetching from "${collectionName}" collection`, { status: 500 });
    }
}

export async function getById(model: mongoose.Model<any>, id: string) {
    const collectionName = model.collection.collectionName;

    try {
        const data = await model.findById(id);

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return new NextResponse(`getById: Error when querying "${id}" from "${collectionName}" collection`, { status: 500 });
    }
}