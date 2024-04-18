import DataModel from '../schemas/data.schema';
import {IData, Query} from "../models/data.model";
import {config} from "../../config";

export default class DataService {

    public async createData(dataParams: IData) {
        try {
            const dataModel = new DataModel(dataParams);
            await dataModel.save();
        } catch (error) {
            console.error('Wystąpił błąd podczas tworzenia danych:', error);
            throw new Error('Wystąpił błąd podczas tworzenia danych');
        }
    }

    public async get(deviceID: string) {
        try {
            const data = await DataModel.find({deviceId: deviceID},
                { __v: 0, _id: 0 }).limit(1).sort({$natural:-1});
            return data;
        } catch (error) {
            console.error('Wystąpił błąd podczas odczytu danych:', error);
            throw new Error('Wystąpił błąd podczas odczytu danych');
        }
    }

    public async getAllNewest() {
        try {
            const latestData: IData[] = [];

            await Promise.all(Array.from({length: config.supportedDevicesNum},
            async (_, i) => {
                try {
                    const latestEntry = await this.get(i.toString());
                    console.log(latestEntry);

                    if (latestEntry.length) {
                        latestData.push(latestEntry[0]);
                    } else {
                        latestData.push({deviceId: i, temperature: null, pressure: null, humidity: null});
                    }

                } catch (error) {
                    console.error(`Błąd pobierania danych dla urządzenia ${i+1}: ${error.message}`)
                }
            }));
            return latestData;
        } catch (error) {
            console.error('Wystąpił błąd podczas odczytu danych:', error);
            throw new Error('Wystąpił błąd podczas odczytu danych');
        }
    }

     public async deleteData(deviceID: string) {
        try {
            const deletedData = await DataModel.deleteMany({deviceId: deviceID});
            return deletedData;
        } catch (e) {
            throw new Error(`Deleting failed: ${e}`);
        }
     }

    public async query(deviceID: string) {
        try {
            const data = await DataModel.find({deviceId: deviceID}, { __v: 0, _id: 0 });
            return data;
        } catch (error) {
            throw new Error(`Query failed: ${error}`);
        }
    }
}
