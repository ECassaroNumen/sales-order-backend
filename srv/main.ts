import cds, { Request, Service } from '@sap/cds';
import { Customers, Products, SalesOrderItem, SalesOrderItems, SalesOrderHeader, SalesOrderHeaders } from '@models/sales';
import { customerController } from './factories/controllers/customer';
import { salesOrderHeaderController } from './factories/controllers/sales-order-header';
import { FullRequestParams } from './protocols';

export default (service: Service)=>{
    service.before('READ',"*", (req: Request)=>{
        if (!req.user.is('read_only_user')) {
            req.reject(403, 'Forbidden. Precisaria ser read_only_user');
        }
    });

    service.before(['WRITE','DELETE'],"*", (req: Request)=>{
        if (!req.user.is('admin')) {
            req.reject(403, 'Forbidden.  Precisaria ser admin');
        }
    });    

    service.after('READ', 'Customers', (customersList: Customers, request)=>{
        (request as unknown as FullRequestParams<Customers>).results = customerController.afterRead(customersList);
    })

    service.before('CREATE', 'SalesOrderHeaders', async (request: Request)=>{
        const result = await salesOrderHeaderController.beforeCreate(request.data);
        if (result.hasError) {
            request.reject(400,result.error?.message as string);
        }
        request.data.totalAmount = result.totalAmount;
    });

    service.after('CREATE', 'SalesOrderHeaders', async (salesOrderHeaders: SalesOrderHeaders, request: Request)=>{
        await salesOrderHeaderController.afterCreate(salesOrderHeaders, request.user);
    });
}