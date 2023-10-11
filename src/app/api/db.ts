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
            savedData
        }, { status: 200 });

    } catch (error) {
        console.log(error);
        return new NextResponse(`Error when uploading data to "${collectionName}" collection`, { status: 500 });
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
        console.log(error);
        return new NextResponse(`Error when updating "${data.name}" from "${collectionName}" collection`, { status: 500 });
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
        return new NextResponse(`Error when deleting "${data.name}" from "${collectionName}" collection`, { status: 500 });
    }
}

async function getPractitionerById(model: mongoose.Model<any>, id: string) {
    const collectionName = model.collection.collectionName;

    try {
        const data = await model.findById(id);

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return new NextResponse(`Error when querying "${id}" from "${collectionName}" collection`, { status: 500 });
    }
}

async function getPractitionerByName(model: mongoose.Model<any>, name: string) {
    const collectionName = model.collection.collectionName;

    try {
        const data = await model.findOne({ name: name });

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return new NextResponse(`Error when querying "${name}" from "${collectionName}" collection`, { status: 500 });
    }
}