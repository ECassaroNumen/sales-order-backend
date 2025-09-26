import cds, { Request, Service } from '@sap/cds';
import { Customers } from '@models/sales';

export default (service: Service)=>{
    service.after('READ', 'Customers', (results: Customers)=>{
        console.log('>>> Results from Customers:', results);
    })

    service.before('CREATE', 'SalesOrderHeaders', async (request: Request)=>{
        const params = request.data

        if (!params.items || params.items?.length === 0) {
            request.reject(400, 'At least one item is required');
        }

        if (!params.customer_id) {
            request.reject(400, 'customer_id is required');
        }

        const customerQuery = SELECT.one.from('sales.Customers').where({ id: params.customer_id } )

        const customer = await cds.run(customerQuery);

        if (!customer) {
            request.reject(404, `Customer with id ${params.customer_id} not found`);
        }
    });
}