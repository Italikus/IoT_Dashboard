import Controller from '../interfaces/controller.interface';
import {Request, Response, NextFunction, Router} from 'express';

let testArr = [4,5,6,3,5,3,7,5,13,5,6,4,3,6,3,6];

class DataController implements Controller {
    public path = '/api/data';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/latest`, this.getLatestReadingsFromAllDevices);
        this.router.get(`${this.path}/:id`, this.findById);
        this.router.get(`${this.path}/:id/latest`, this.findLatestById);
        this.router.get(`${this.path}/:id/:num`, this.findByRange);

        this.router.post(`${this.path}/:id`, this.addData);

        this.router.delete(`${this.path}/all`, this.deleteAll);
        this.router.delete(`${this.path}/:id`, this.deleteById);
    }

    private addData= async (request: Request, response: Response, next: NextFunction) => {
        const {elem} = request.body;
        const {id} = request.params

        testArr.push(elem);
        response.status(200).json(elem);
    }

    private getLatestReadingsFromAllDevices = async (request: Request, response: Response, next: NextFunction) => {
        response.status(200).json(testArr);
    }

    private findById = async (request: Request, response: Response, next: NextFunction) => {
        const {id} = request.params;
        response.status(200).json(testArr[Number(id)]);
    }

    private findLatestById = async (request: Request, response: Response, next: NextFunction) => {
        let maxVal = testArr[0] || -Infinity;

        testArr.forEach(v => {
            if (maxVal < v) maxVal = v;
        })

        response.status(200).json(maxVal)
    }

    private findByRange = async (request: Request, response: Response, next: NextFunction) => {
        const {id, num} = request.params;
        const data = testArr.slice(Number(id)-1, Number(id)-1 + Number(num))

        response.status(200).json(data)
    }

    private deleteById = async (request: Request, response: Response, next: NextFunction) => {
        const {id} = request.params;
        const elem = testArr[Number(id)-1];
        testArr.splice(Number(id)-1, 1);
        response.status(200).json(elem);
    }

    private deleteAll = async (request: Request, response: Response, next: NextFunction) => {
        testArr = [];
        response.status(200).json(testArr);
    }
}

export default DataController;
