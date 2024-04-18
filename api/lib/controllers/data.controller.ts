import Controller from '../interfaces/controller.interface';
import {Request, Response, NextFunction, Router} from 'express';
import {checkIdParam} from "../middlewares/deviceIdParam.middleware";
import DataService from "../modules/services/data.service";
import {config} from "../config";

// @ts-ignore
const dataService = require("../modules/services/data.service");

let testArr = [4,5,6,3,5,3,7,5,13,5,6,4,3,6,3,6];

class DataController implements Controller {
    public path = '/api/data';
    public router = Router();
    private dataService = new DataService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/latest`,this.getLatestReadingsFromAllDevices);
        this.router.get(`${this.path}/:id`, checkIdParam, this.getAllDeviceData);
        this.router.get(`${this.path}/:id/latest`, checkIdParam, this.findLatestById);
        this.router.get(`${this.path}/:id/:num`, checkIdParam, this.findByRange);

        this.router.post(`${this.path}/:id`, checkIdParam, this.addData);

        this.router.delete(`${this.path}/all`, this.deleteAll);
        this.router.delete(`${this.path}/:id`, checkIdParam, this.deleteById);
    }
    private getAllDeviceData = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        try {
            const allData = await this.dataService.query(id);
            response.status(200).json(allData);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(400).json({ error: 'Invalid device id.' });
        }
    };
    private addData = async (request: Request, response: Response, next: NextFunction) => {
        const { air } = request.body;
        const { id } = request.params;

        const data = {
            deviceId: Number(id),
            temperature: air[0],
            pressure: air[1],
            humidity: air[2],
            date: Date
        }
        try {
            await this.dataService.createData(data);
            response.status(200).json(data);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(400).json({ error: 'Invalid input data.' });
        }
    };

    private getLatestReadingsFromAllDevices = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const latestData = await this.dataService.getAllNewest();
            response.status(200).json(latestData);
        } catch (error) {
            console.error(`Reading Error: ${error.message}`);
            response.status(400).json({ error: 'Reading from db error.' });
        }
    }

    private findLatestById = async (request: Request, response: Response, next: NextFunction) => {
        const {id} = request.params;

        try {
            const latestData = await this.dataService.get(id);
            response.status(200).json(latestData);
        } catch (error) {
            console.error(`Reading Error: ${error.message}`);
            response.status(400).json({ error: 'Reading from db error.' });
        }
    }

    private findByRange = async (request: Request, response: Response, next: NextFunction) => {
        const {id, num} = request.params;
        const data = testArr.slice(Number(id)-1, Number(id)-1 + Number(num))

        response.status(200).json(data)
    }

    private deleteById = async (request: Request, response: Response, next: NextFunction) => {
        const {id} = request.params;
        try {
            const latestData = await this.dataService.deleteData(id);
            response.status(200).json(latestData);
        } catch (error) {
            console.error(`Deleting Error: ${error.message}`);
            response.status(400).json({ error: 'Deleting from db error.' });
        }
    }

    private deleteAll = async (request: Request, response: Response, next: NextFunction) => {
        try {
            Array.from({length: config.supportedDevicesNum}, async (_, i) => {
                await this.dataService.deleteData(i.toString());
            });
            response.status(200).json({message: "All data has been deleted."});
        } catch (error) {
            console.error(`Deleting Error: ${error.message}`);
            response.status(400).json({ error: 'Deleting from db error.' });
        }
    }
}

export default DataController;
