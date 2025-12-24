import { SalesOrderHeader } from "@models/sales";
import { SalesOrderHeaderService } from "srv/services/sales-order-header/protocol";
import { SalesOrderHeaderController } from "./protocol";

export type CreationPayloadValidationResult = {
    hasError: boolean;
    totalAmount?: number;
    error?: Error;
}

export class SalesOrderHeaderControllerImpl implements SalesOrderHeaderController {
    constructor(private readonly service: SalesOrderHeaderService) {}

    public async beforeCreate(params: SalesOrderHeader): Promise<CreationPayloadValidationResult> {
        return this.service.beforeCreate(params);
    }
}