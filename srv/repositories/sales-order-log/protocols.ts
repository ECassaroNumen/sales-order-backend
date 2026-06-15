import { SalesOrderLogModel } from 'srv/models/sales-order-logs';

export interface SalesOrderLogRepository {
    create(logs: SalesOrderLogModel[]): Promise<void>;
}
